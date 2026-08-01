/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import Conductor from './conductores.entity';

import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

import { InstitucionesService } from '../instituciones/instituciones.service';

import { CreateConductorDto } from './dtos/create-conductor.dto';
import { UpdateConductorDto } from './dtos/update-conductor.dto';

export const CACHE_KEY = (institucion = 0) =>
  institucion === 0
    ? 'conductores:list:all'
    : `conductores:list:institucion:${institucion}`;

@Injectable()
export class ConductoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly instituciones: InstitucionesService,
    @InjectPinoLogger(ConductoresService.name)
    private readonly logger: PinoLogger,
  ) { }

  private normalizeText(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private async getUsuariosMap(): Promise<Map<number, any>> {
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/usuarios`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.warn(
          {
            status: response.status,
            error: errorData,
          },
          'No fue posible obtener los usuarios desde auth_service',
        );
        return new Map();
      }

      const usuarios = await response.json();
      return new Map((Array.isArray(usuarios) ? usuarios : []).map((usuario) => [usuario.id, usuario]));
    } catch (error) {
      this.logger.warn(
        {
          err: error,
        },
        'Error de comunicación con auth_service al obtener todos los usuarios',
      );
      return new Map();
    }
  }

  /**
   * CREATE
   */
  async create(dto: CreateConductorDto) {
    this.logger.info(
      {
        curp: dto.curp,
      },
      'Creando conductor',
    );

    const { licencia, ...conductorData } = dto;

    // 1. Validar existencia de la institución
    await this.instituciones.findOne(conductorData.institucion_id);

    // ==============================================================
    // 2. COMUNICACIÓN CON AUTH_SERVICE: CREAR EL USUARIO PRIMERO
    // ==============================================================
    let usuarioCreado: { id: number };

    // Configura esta URL en tus variables de entorno (.env)
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

    try {
      this.logger.debug('Llamando a auth_service para crear Usuario');

      const passwordTemporal = `Temp.@123${conductorData.curp.substring(0, 4)}`;

      // Preparamos los datos EXACTAMENTE como los espera el CreateUsuarioDto
      const payloadUsuario = {
        nombres: conductorData.nombres,
        apellido_paterno: conductorData.apellido_paterno,
        apellido_materno: conductorData.apellido_materno,
        curp: conductorData.curp,
        // Si conductorData.fecha_nacimiento es un objeto Date, lo pasamos a ISOString
        // para que viaje correctamente por JSON
        fecha_nacimiento: new Date(conductorData.fecha_nacimiento).toISOString(),
        telefono: conductorData.telefono,
        email: conductorData.email,
        foto_perfil: conductorData.foto_perfil,
        contra: passwordTemporal, // AHORA SÍ PASARÁ EL DTO
      };

      const response = await fetch(`${AUTH_SERVICE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadUsuario),
      });

      if (!response.ok) {
        // Extraemos el error que lanzó el auth_service (ej. "El correo ya existe")
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido en auth_service');
      }

      usuarioCreado = await response.json();
      this.logger.info({ usuario_id: usuarioCreado.id }, 'Usuario creado exitosamente en auth_service');

    } catch (error: any) {
      this.logger.error({ err: error }, 'Fallo al crear usuario en auth_service');
      // Si falla la creación del usuario, detenemos todo y lanzamos error al Frontend
      throw new BadRequestException(`No se pudo crear el usuario: ${error.message}`);
    }

    const rollbackUsuarioCreado = async (userId: number) => {
      try {
        const rollbackResponse = await fetch(`${AUTH_SERVICE_URL}/usuarios/${userId}`, {
          method: 'DELETE',
        });

        if (!rollbackResponse.ok) {
          const rollbackError = await rollbackResponse.json().catch(() => ({}));
          this.logger.warn(
            {
              userId,
              status: rollbackResponse.status,
              error: rollbackError,
            },
            'No se pudo ejecutar el rollback del usuario en auth_service',
          );
          return;
        }

        this.logger.warn(
          { userId },
          'Rollback del usuario ejecutado en auth_service',
        );
      } catch (error) {
        this.logger.error(
          { userId, err: error },
          'Error al intentar hacer rollback del usuario en auth_service',
        );
      }
    };

    try {
      // 3. Crear el Conductor usando el ID del usuario recién creado
      const conductor = await this.prisma.$transaction(async (tx) => {
        const nuevoConductor = await tx.conductor.create({
          data: {
            usuario_id: usuarioCreado.id,
            institucion: {
              connect: { id: conductorData.institucion_id },
            },
          },
        });

        await tx.licencia.create({
          data: {
            conductor_id: nuevoConductor.id,
            numero_licencia: licencia.numero_licencia.trim().replace(/\s+/g, '').toUpperCase(),
            categoria: licencia.categoria.trim().toUpperCase(),
            fecha_expedicion: new Date(licencia.fecha_expedicion),
            fecha_vencimiento: new Date(licencia.fecha_vencimiento),
            estado_emisor: this.normalizeText(licencia.estado_emisor),
            imagen_licencia: licencia.imagen_licencia.trim(),
            vigente: true,
          },
        });

        return nuevoConductor;
      });

      try {
        await Promise.all([
          this.redis.del(CACHE_KEY()),
          this.redis.del(CACHE_KEY(conductor.institucion_id)),
        ]);

        this.logger.debug(
          {
            keys: [
              CACHE_KEY(),
              CACHE_KEY(conductor.institucion_id),
            ],
          },
          'Caché eliminada',
        );
      } catch (error) {
        this.logger.error(
          {
            err: error,
          },
          'Error al limpiar caché',
        );
      }

      this.logger.info(
        {
          conductorId: conductor.id,
        },
        'Conductor creado',
      );

      return conductor;
    } catch (error) {
      if (usuarioCreado?.id) {
        await rollbackUsuarioCreado(usuarioCreado.id);
      }

      this.logger.error(
        {
          err: error,
          usuario_id: usuarioCreado?.id,
        },
        'Fallo al crear conductor; se ejecuta rollback del usuario en auth_service',
      );

      throw error;
    }
  }

  /**
   * FIND ALL
   */
  async findAll(active: boolean, institucion = 0) {
    this.logger.debug('Obteniendo todos los conductores');

    const cacheKey = CACHE_KEY(institucion);

    // Buscar en caché
    try {
      const cached =
        await this.redis.get<Conductor[]>(cacheKey);

      if (cached) {
        const usuariosMap = await this.getUsuariosMap();

        this.logger.debug(
          {
            key: cacheKey,
            source: 'cache',
            count: cached.length,
          },
          'Conductores obtenidos desde caché',
        );

        const mappedCached = (active ? cached.filter((c) => c.estatus) : cached).map((c) => {
          const usuario = usuariosMap.get(c.usuario_id);
          return this.mapConductorResponse(c, usuario);
        });

        return mappedCached;
      }
    } catch (error) {
      this.logger.error(
        {
          key: cacheKey,
          err: error,
        },
        'Error al obtener conductores desde caché',
      );
    }

    const where: Prisma.ConductorWhereInput = {};

    if (active) {
      where.estatus = true;
    }

    if (institucion !== 0) {
      where.institucion_id = institucion;
    }

    const conductores = await this.prisma.conductor.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        institucion: true,
        licencias: {
          where: {
            vigente: true,
          },
        },
      },
    });

    try {
      await this.redis.set(cacheKey, conductores, 30 * 60);

      this.logger.debug(
        {
          key: cacheKey,
        },
        'Conductores almacenados en caché',
      );
    } catch (error) {
      this.logger.error(
        {
          key: cacheKey,
          err: error,
        },
        'Error al guardar conductores en caché',
      );
    }

    this.logger.debug(
      {
        source: 'database',
        count: conductores.length,
      },
      'Conductores obtenidos desde base de datos',
    );

    const usuariosMap = await this.getUsuariosMap();

    const mapped = conductores.map((c) => {
      const usuario = usuariosMap.get(c.usuario_id);
      return this.mapConductorResponse(c, usuario);
    });

    return mapped;
  }


  private mapConductorResponse(conductor: any, usuario?: any) {
    const { licencias, ...rest } = conductor;

    const fechaNacimiento = usuario?.fecha_nacimiento
      ? new Date(usuario.fecha_nacimiento).toISOString()
      : rest.fecha_nacimiento
        ? new Date(rest.fecha_nacimiento).toISOString()
        : '';

    return {
      ...rest,
      ...(usuario
        ? {
          nombres: usuario.nombres ?? rest.nombres ?? '',
          apellido_paterno: usuario.apellido_paterno ?? rest.apellido_paterno ?? '',
          apellido_materno: usuario.apellido_materno ?? rest.apellido_materno ?? '',
          fecha_nacimiento: fechaNacimiento,
          telefono: usuario.telefono ?? rest.telefono ?? '',
          email: usuario.email ?? rest.email ?? '',
          curp: usuario.curp ?? rest.curp ?? '',
          foto_perfil: usuario.foto_perfil ?? rest.foto_perfil ?? '',
        }
        : {
          nombres: rest.nombres ?? '',
          apellido_paterno: rest.apellido_paterno ?? '',
          apellido_materno: rest.apellido_materno ?? '',
          fecha_nacimiento: fechaNacimiento,
          telefono: rest.telefono ?? '',
          email: rest.email ?? '',
          curp: rest.curp ?? '',
          foto_perfil: rest.foto_perfil ?? '',
        }),
      licencia: licencias.length > 0 ? licencias[0] : null,
    };
  }

  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo conductor por ID');

    const conductor = await this.prisma.conductor.findUnique({
      where: { id },
      include: {
        institucion: true,
        licencias: {
          where: {
            vigente: true,
          },
        },
      },
    });

    if (!conductor) {
      this.logger.warn(
        { id },
        'Conductor no encontrado',
      );

      throw new NotFoundException(
        `Conductor ${id} no existe`,
      );
    }

    this.logger.info(
      {
        id: conductor.id,
        usuario_id: conductor.usuario_id,
      },
      'Conductor encontrado',
    );

    const usuariosMap = await this.getUsuariosMap();
    const usuario = usuariosMap.get(conductor.usuario_id);
    return this.mapConductorResponse(conductor, usuario);
  }

  async update(id: number, dto: UpdateConductorDto) {
    this.logger.info(
      {
        conductorId: id,
      },
      'Actualizando conductor',
    );

    const existing = await this.findOne(id);
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

    const usuarioPayload = Object.fromEntries(
      Object.entries(dto)
        .filter(([key, value]) => {
          if (value === undefined || value === null || value === '') return false;

          return [
            'nombres',
            'apellido_paterno',
            'apellido_materno',
            'curp',
            'fecha_nacimiento',
            'telefono',
            'email',
            'foto_perfil',
          ].includes(key);
        })
        .map(([key, value]) => {
          if (key === 'fecha_nacimiento' && typeof value === 'string') {
            return [key, new Date(value).toISOString()];
          }
          return [key, value];
        }),
    );

    const previousUser = existing.usuario_id
      ? await fetch(`${AUTH_SERVICE_URL}/usuarios/${existing.usuario_id}`)
        .then(async (response) => {
          if (!response.ok) return null;
          return response.json();
        })
        .catch(() => null)
      : null;

    try {
      if (Object.keys(usuarioPayload).length > 0 && existing.usuario_id) {
        const userResponse = await fetch(`${AUTH_SERVICE_URL}/usuarios/${existing.usuario_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuarioPayload),
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'No se pudo actualizar el usuario en auth_service');
        }
      }

      if (dto.institucion_id) {
        await this.instituciones.findOne(dto.institucion_id);
      }

      const conductor = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.conductor.update({
          where: { id },
          data: {
            institucion: {
              connect: {
                id: dto.institucion_id ?? existing.institucion_id,
              },
            },
          },
        });

        return updated;
      });

      await Promise.all([
        this.redis.del(CACHE_KEY()),
        this.redis.del(CACHE_KEY(existing.institucion_id)),
        dto.institucion_id && dto.institucion_id !== existing.institucion_id
          ? this.redis.del(CACHE_KEY(dto.institucion_id))
          : Promise.resolve(),
      ]);

      return this.findOne(conductor.id);
    } catch (error) {
      if (previousUser && existing.usuario_id) {
        try {
          await fetch(`${AUTH_SERVICE_URL}/usuarios/${existing.usuario_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(previousUser),
          });
        } catch (rollbackError) {
          this.logger.warn(
            { userId: existing.usuario_id, err: rollbackError },
            'No se pudo devolver los datos del usuario tras un fallo en la actualización del conductor',
          );
        }
      }

      this.logger.error(
        {
          err: error,
          usuario_id: existing.usuario_id,
          conductor_id: id,
        },
        'Fallo al actualizar conductor',
      );

      throw error;
    }
  }


  /**
   * SHUTDOWN (activar/desactivar)
   */
  async shutdown(id: number) {
    this.logger.debug({ id }, 'Cambiando estado de conductor');

    const existing = await this.findOne(id); // 404 si no existe

    await this.prisma.conductor.update({
      where: { id },
      data: { estatus: !existing.estatus },
    });

    this.logger.info(
      { id, newStatus: !existing.estatus },
      'Estado de conductor cambiado',
    );

    try {
      await Promise.all([
        this.redis.del(CACHE_KEY()),
        this.redis.del(CACHE_KEY(existing.institucion_id)),
      ]);

      this.logger.debug(
        {
          keys: [CACHE_KEY(), CACHE_KEY(existing.institucion_id)],
        },
        'Caché eliminada',
      );
    } catch (error) {
      this.logger.error(
        {
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return { updated: true };
  }

  /**
   * REMOVE (eliminación permanente)
   */
  async remove(id: number) {
    this.logger.debug({ id }, 'Eliminando conductor permanentemente');

    const existing = await this.findOne(id); // 404 si no existe

    await this.prisma.conductor.delete({ where: { id } });
    this.logger.info({ id }, 'Conductor eliminado permanentemente');

    try {
      await Promise.all([
        this.redis.del(CACHE_KEY()),
        this.redis.del(CACHE_KEY(existing.institucion_id)),
      ]);

      this.logger.debug(
        {
          keys: [CACHE_KEY(), CACHE_KEY(existing.institucion_id)],
        },
        'Caché eliminada',
      );
    } catch (error) {
      this.logger.error(
        {
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return { deleted: true };
  }


  // find para salida
  async findConductorSalida(id: number) {
    this.logger.debug(
      { id },
      'Obteniendo conductor para módulo de salidas',
    );

    const conductor = await this.prisma.conductor.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        usuario_id: true,
        estatus: true,
      },
    });

    if (!conductor) {
      this.logger.warn(
        { id },
        'Conductor no encontrado',
      );

      throw new NotFoundException(
        `Conductor ${id} no existe`,
      );
    }

    let usuario: {
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
    };

    try {
      const response = await fetch(
        `${process.env.AUTH_SERVICE_URL}/usuarios/${conductor.usuario_id}`,
      );

      if (!response.ok) {
        throw new Error();
      }

      usuario = await response.json();
    } catch (error) {
      this.logger.error(
        {
          err: error,
          usuario_id: conductor.usuario_id,
        },
        'No fue posible obtener la información del usuario',
      );

      throw new BadRequestException(
        'No fue posible obtener la información del conductor',
      );
    }

    return {
      id: conductor.id,
      estatus: conductor.estatus,
      nombre: `${usuario.nombres} ${usuario.apellido_paterno} ${usuario.apellido_materno}`,
    };
  }
}

