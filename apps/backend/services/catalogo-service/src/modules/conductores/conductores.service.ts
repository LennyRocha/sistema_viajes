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

type UsuarioUpdatePayload = {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  curp?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  email?: string;
  foto_perfil?: string;
};

type UsuarioStatusSyncResult = {
  changed: boolean;
  previousStatus: boolean;
};

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

  private internalHeaders(extra: Record<string, string> = {}) {
    return {
      ...extra,
      'x-internal-service-token': process.env.INTERNAL_SERVICE_TOKEN ?? '',
    };
  }

  private buildUsuarioUpdatePayload(
    source: Record<string, any>,
    options: { includeEmptyStrings?: boolean } = {},
  ): UsuarioUpdatePayload {
    const allowedFields = [
      'nombres',
      'apellido_paterno',
      'apellido_materno',
      'curp',
      'fecha_nacimiento',
      'telefono',
      'email',
      'foto_perfil',
    ];

    return Object.fromEntries(
      Object.entries(source)
        .filter(([key, value]) => {
          if (!allowedFields.includes(key)) return false;
          if (value === undefined || value === null) return false;
          if (!options.includeEmptyStrings && value === '') return false;
          return true;
        })
        .map(([key, value]) => {
          if (key === 'fecha_nacimiento' && value) {
            return [key, new Date(value).toISOString()];
          }

          return [key, value];
        }),
    );
  }

  private async getUsuariosMap(userIds: number[] = []): Promise<Map<number, any>> {
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
    const internalToken = process.env.INTERNAL_SERVICE_TOKEN;

    if (!internalToken) {
      this.logger.error(
        'INTERNAL_SERVICE_TOKEN no está configurado en catalogo-service; no es posible hidratar usuarios de conductores',
      );
      return new Map();
    }

    const uniqueUserIds = [...new Set(userIds.filter((id) => Number.isInteger(id) && id > 0))];

    try {
      if (uniqueUserIds.length === 0) {
        const response = await fetch(`${AUTH_SERVICE_URL}/usuarios`, {
          headers: this.internalHeaders(),
        });

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
        return new Map(
          (Array.isArray(usuarios) ? usuarios : []).map((usuario) => [usuario.id, usuario]),
        );
      }

      const usuarios = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const response = await fetch(`${AUTH_SERVICE_URL}/usuarios/${userId}`, {
              headers: this.internalHeaders(),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              this.logger.warn(
                {
                  userId,
                  status: response.status,
                  error: errorData,
                },
                'No fue posible obtener un usuario específico desde auth_service',
              );
              return null;
            }

            return await response.json();
          } catch (error) {
            this.logger.warn(
              {
                userId,
                err: error,
              },
              'Error de comunicación con auth_service al obtener un usuario específico',
            );
            return null;
          }
        }),
      );

      return new Map(
        usuarios
          .filter((usuario): usuario is Record<string, any> => Boolean(usuario?.id))
          .map((usuario) => [usuario.id, usuario]),
      );
    } catch (error) {
      this.logger.warn(
        {
          err: error,
          requestedUserIds: uniqueUserIds,
        },
        'Error de comunicación con auth_service al obtener usuarios de conductores',
      );
      return new Map();
    }
  }

  private async getUsuarioById(userId: number) {
    const usuariosMap = await this.getUsuariosMap([userId]);
    return usuariosMap.get(userId) ?? null;
  }

  private async setUsuarioStatus(
    userId: number,
    targetStatus: boolean,
  ): Promise<UsuarioStatusSyncResult> {
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
    const usuario = await this.getUsuarioById(userId);

    if (!usuario) {
      throw new BadRequestException(
        `No fue posible obtener el usuario ${userId} para sincronizar su estatus`,
      );
    }

    const previousStatus = usuario.estatus !== false;
    if (previousStatus === targetStatus) {
      return { changed: false, previousStatus };
    }

    const response = await fetch(`${AUTH_SERVICE_URL}/usuarios/status/${userId}`, {
      method: 'DELETE',
      headers: this.internalHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      this.logger.error(
        {
          userId,
          targetStatus,
          status: response.status,
          error: errorData,
        },
        'No fue posible sincronizar el estatus del usuario en auth_service',
      );
      throw new BadRequestException(
        `No fue posible sincronizar el estatus del usuario ${userId}`,
      );
    }

    return { changed: true, previousStatus };
  }

  private async rollbackUsuarioStatus(
    userId: number,
    statusChange: UsuarioStatusSyncResult,
  ) {
    if (!statusChange.changed) return;

    try {
      await this.setUsuarioStatus(userId, statusChange.previousStatus);
    } catch (error) {
      this.logger.error(
        {
          userId,
          err: error,
        },
        'No se pudo restaurar el estatus del usuario tras un fallo en conductor',
      );
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
    let usuarioCreado: {
      id: number;
      curp?: string;
      email?: string;
      telefono?: string;
    } | null = null;
    let usuarioCreadoEnAuth = false;

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
        headers: this.internalHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payloadUsuario),
      });

      if (!response.ok) {
        // Extraemos el error que lanzó el auth_service (ej. "El correo ya existe")
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido en auth_service');
      }

      const createdUser = await response.json();
      usuarioCreado = createdUser;
      usuarioCreadoEnAuth = true;
      this.logger.info({ usuario_id: createdUser.id }, 'Usuario creado exitosamente en auth_service');

    } catch (error: any) {
      const originalMessage =
        error instanceof Error ? error.message : 'Error desconocido en auth_service';

      this.logger.warn(
        { err: error, curp: conductorData.curp },
        'No se pudo crear usuario; buscando posible usuario huerfano por CURP',
      );
      // Si falla la creación del usuario, detenemos todo y lanzamos error al Frontend
      try {
        const existingResponse = await fetch(
          `${AUTH_SERVICE_URL}/usuarios/curp/${encodeURIComponent(conductorData.curp)}`,
          { headers: this.internalHeaders() },
        );

        if (!existingResponse.ok) {
          throw new Error(originalMessage);
        }

        const existingUser = await existingResponse.json();
        const sameEmail =
          String(existingUser.email || '').toLowerCase() ===
          String(conductorData.email || '').toLowerCase();
        const sameTelefono =
          String(existingUser.telefono || '') === String(conductorData.telefono || '');

        if (!sameEmail || !sameTelefono) {
          throw new Error(originalMessage);
        }

        const existingConductor = await this.prisma.conductor.findUnique({
          where: { usuario_id: existingUser.id },
        });

        if (existingConductor) {
          throw new Error('Ya existe un conductor ligado a esos datos.');
        }

        usuarioCreado = existingUser;
        usuarioCreadoEnAuth = false;
        this.logger.warn(
          { usuario_id: existingUser.id },
          'Se reutiliza usuario huerfano de auth_service para crear conductor',
        );
      } catch (lookupError: any) {
        this.logger.error({ err: lookupError }, 'Fallo al crear usuario en auth_service');
        throw new BadRequestException(
          `No se pudo crear el usuario: ${lookupError.message || originalMessage}`,
        );
      }
    }

    const rollbackUsuarioCreado = async (userId: number) => {
      try {
        const rollbackResponse = await fetch(`${AUTH_SERVICE_URL}/usuarios/${userId}`, {
          method: 'DELETE',
          headers: this.internalHeaders(),
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

    if (!usuarioCreado) {
      throw new BadRequestException('No se pudo resolver el usuario del conductor');
    }

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
      if (usuarioCreadoEnAuth && usuarioCreado?.id) {
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

      if (cached && process.env.CONDUCTORES_CACHE === 'true') {
        const usuariosMap = await this.getUsuariosMap(cached.map((c) => c.usuario_id));

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

    const usuariosMap = await this.getUsuariosMap(conductores.map((c) => c.usuario_id));

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

    const usuariosMap = await this.getUsuariosMap([conductor.usuario_id]);
    const usuario = usuariosMap.get(conductor.usuario_id);
    return this.mapConductorResponse(conductor, usuario);
  }

  async findByUsuarioId(usuarioId: number) {
    const conductor = await this.prisma.conductor.findUnique({
      where: { usuario_id: usuarioId },
      select: { id: true, usuario_id: true, estatus: true },
    });
    if (!conductor || !conductor.estatus) {
      throw new NotFoundException(`El usuario ${usuarioId} no tiene conductor activo`);
    }
    return conductor;
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

    const usuarioPayload = this.buildUsuarioUpdatePayload(dto);

    const previousUser = existing.usuario_id
      ? await this.getUsuarioById(existing.usuario_id)
      : null;
    const rollbackUsuarioPayload = previousUser
      ? this.buildUsuarioUpdatePayload(previousUser, { includeEmptyStrings: true })
      : null;

    try {
      if (Object.keys(usuarioPayload).length > 0 && existing.usuario_id) {
        const userResponse = await fetch(`${AUTH_SERVICE_URL}/usuarios/${existing.usuario_id}`, {
          method: 'PATCH',
          headers: this.internalHeaders({ 'Content-Type': 'application/json' }),
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
      if (rollbackUsuarioPayload && existing.usuario_id) {
        try {
          const rollbackResponse = await fetch(`${AUTH_SERVICE_URL}/usuarios/${existing.usuario_id}`, {
            method: 'PATCH',
            headers: this.internalHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(rollbackUsuarioPayload),
          });

          if (!rollbackResponse.ok) {
            const rollbackError = await rollbackResponse.json().catch(() => ({}));
            this.logger.warn(
              {
                userId: existing.usuario_id,
                status: rollbackResponse.status,
                error: rollbackError,
              },
              'Auth_service rechazó el rollback de datos del usuario',
            );
          }
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
    const newStatus = !existing.estatus;
    const usuarioStatusChange = await this.setUsuarioStatus(existing.usuario_id, newStatus);

    try {
      await this.prisma.conductor.update({
        where: { id },
        data: { estatus: newStatus },
      });
    } catch (error) {
      await this.rollbackUsuarioStatus(existing.usuario_id, usuarioStatusChange);
      throw error;
    }

    this.logger.info(
      { id, newStatus },
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
   * REMOVE (baja lógica)
   */
  async remove(id: number) {
    this.logger.debug({ id }, 'Eliminando conductor');

    const existing = await this.findOne(id); // 404 si no existe
    const usuarioStatusChange = await this.setUsuarioStatus(existing.usuario_id, false);

    try {
      await this.prisma.conductor.update({
        where: { id },
        data: { estatus: false },
      });
    } catch (error) {
      await this.rollbackUsuarioStatus(existing.usuario_id, usuarioStatusChange);
      throw error;
    }

    this.logger.info({ id }, 'Conductor dado de baja lógicamente');

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

    const usuariosMap = await this.getUsuariosMap([conductor.usuario_id]);
    const usuario = usuariosMap.get(conductor.usuario_id) as
      | {
          nombres: string;
          apellido_paterno: string;
          apellido_materno: string;
        }
      | undefined;

    if (!usuario) {
      this.logger.error(
        {
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

