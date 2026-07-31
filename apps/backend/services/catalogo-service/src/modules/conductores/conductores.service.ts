/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
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

  /**
   * Normaliza un texto:
   *  - elimina espacios sobrantes
   *  - convierte a minúsculas
   *  - capitaliza cada palabra
   */
  private normalizeText(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
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

    // Validar existencia de la institución
    await this.instituciones.findOne(conductorData.institucion_id);

    const conductor = await this.prisma.$transaction(async (tx) => {
      const nuevoConductor = await tx.conductor.create({
        data: {
          nombres: this.normalizeText(conductorData.nombres),

          apellido_paterno: this.normalizeText(
            conductorData.apellido_paterno,
          ),

          apellido_materno: this.normalizeText(
            conductorData.apellido_materno,
          ),

          curp: conductorData.curp
            .trim()
            .replace(/\s+/g, '')
            .toUpperCase(),

          fecha_nacimiento: new Date(conductorData.fecha_nacimiento),

          telefono: conductorData.telefono.trim(),

          email: conductorData.email.trim().toLowerCase(),

          foto_perfil: conductorData.foto_perfil.trim(),

          institucion: {
            connect: {
              id: conductorData.institucion_id,
            },
          },
        },
      });

      await tx.licencia.create({
        data: {
          conductor_id: nuevoConductor.id,

          numero_licencia: licencia.numero_licencia
            .trim()
            .replace(/\s+/g, '')
            .toUpperCase(),

          categoria: licencia.categoria.trim().toUpperCase(),

          fecha_expedicion: new Date(licencia.fecha_expedicion),

          fecha_vencimiento: new Date(licencia.fecha_vencimiento),

          estado_emisor: this.normalizeText(
            licencia.estado_emisor,
          ),

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
        this.logger.debug(
          {
            key: cacheKey,
            source: 'cache',
            count: cached.length,
          },
          'Conductores obtenidos desde caché',
        );

        return active
          ? cached
            .filter((c) => c.estatus)
            .map((c) => this.mapConductorResponse(c))
          : cached.map((c) => this.mapConductorResponse(c));
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

    return conductores.map((c) =>
      this.mapConductorResponse(c),
    );
  }


  private mapConductorResponse(conductor: any) {
    const { licencias, ...rest } = conductor;

    return {
      ...rest,
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
        curp: conductor.curp,
      },
      'Conductor encontrado',
    );

    return this.mapConductorResponse(conductor);
  }

  async update(id: number, dto: UpdateConductorDto) {
    this.logger.info(
      {
        conductorId: id,
      },
      'Actualizando conductor',
    );

    const existing = await this.findOne(id);

    const {...conductorData } = dto;

    if (conductorData.institucion_id) {
      await this.instituciones.findOne(
        conductorData.institucion_id,
      );
    }

    const conductor = await this.prisma.$transaction(
      async (tx) => {
        const updated = await tx.conductor.update({
          where: { id },
          data: {
            nombres: conductorData.nombres
              ? this.normalizeText(conductorData.nombres)
              : existing.nombres,

            apellido_paterno:
              conductorData.apellido_paterno
                ? this.normalizeText(
                  conductorData.apellido_paterno,
                )
                : existing.apellido_paterno,

            apellido_materno:
              conductorData.apellido_materno
                ? this.normalizeText(
                  conductorData.apellido_materno,
                )
                : existing.apellido_materno,

            curp: conductorData.curp
              ? conductorData.curp
                .trim()
                .replace(/\s+/g, '')
                .toUpperCase()
              : existing.curp,

            fecha_nacimiento: conductorData.fecha_nacimiento
              ? new Date(conductorData.fecha_nacimiento)
              : existing.fecha_nacimiento,



            telefono:
              conductorData.telefono?.trim() ??
              existing.telefono,

            email:
              conductorData.email?.trim().toLowerCase() ??
              existing.email,

            foto_perfil:
              conductorData.foto_perfil ??
              existing.foto_perfil,

            institucion: {
              connect: {
                id:
                  conductorData.institucion_id ??
                  existing.institucion_id,
              },
            },
          },
        });


        return updated;
      },
    );

    await Promise.all([
      this.redis.del(CACHE_KEY()),
      this.redis.del(CACHE_KEY(existing.institucion_id)),
      conductor.institucion_id !== existing.institucion_id
        ? this.redis.del(
          CACHE_KEY(conductor.institucion_id),
        )
        : Promise.resolve(),
    ]);

    return this.findOne(conductor.id);
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
}

