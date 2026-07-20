/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateServicioDto } from './dtos/create-servicio.dto';
import { UpdateServicioDto } from './dtos/update-servicio.dto';
import { Prisma } from '@prisma/client';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import ServicioExterno from './servicio.entity';

const LIST_CACHE_KEY = 'servicios:list';

@Injectable()
export class ServiciosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectPinoLogger(ServiciosService.name)
    private readonly logger: PinoLogger,
  ) {}

  async create(dto: CreateServicioDto) {
    this.logger.info(
      {
        nombre: dto.nombre,
      },
      'Creando servicio',
    );

    const servicio = await this.prisma.servicio.create({
      data: {
        ...dto,
        propiedades: dto.propiedades as unknown as Prisma.InputJsonValue,
      },
    });

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al limpiar caché',
      );
    }

    this.logger.info(
      {
        servicioId: servicio.id,
      },
      'Servicio creado',
    );
    return servicio;
  }

  async findAll() {
    this.logger.debug('Obteniendo todos los servicios');

    // 1) ¿está en caché?
    try {
      const cached = await this.redis.get<unknown[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: 'caché',
            count: cached.length,
          },
          'Servicios obtenidos desde caché',
        );
        return cached;
      }
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al obtener servicios desde caché',
      );
    }

    // 2) no está → base de datos
    const servicios = await this.prisma.servicio.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 3) guarda para la próxima (30 minutos)
    try {
      await this.redis.set(LIST_CACHE_KEY, servicios, 30 * 60); // 30 minutos
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al guardar servicios en caché',
      );
    }

    this.logger.debug(
      {
        source: 'database',
        count: servicios.length,
      },
      'Servicios obtenidos desde base de datos y guardados en caché',
    );
    return servicios;
  }

  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo servicio por ID');

    const servicio = await this.prisma.servicio.findUnique({
      where: { id },
    });

    if (!servicio) {
      this.logger.warn(
        {
          id,
        },
        'Servicio no encontrado',
      );
      throw new NotFoundException(`Servicio ${id} no existe`);
    }

    this.logger.info(
      {
        id,
        nombre: servicio.nombre,
      },
      'Servicio encontrado',
    );
    return servicio;
  }

  async findOneName(nombre: string) {
    this.logger.debug({ nombre }, 'Obteniendo servicio por nombre');

    const servicio = await this.prisma.servicio.findUnique({
      where: { nombre },
    });

    if (!servicio) {
      this.logger.warn(
        {
          nombre,
        },
        'Servicio no encontrado por nombre',
      );
      throw new NotFoundException(`Servicio ${nombre} no existe`);
    }

    this.logger.info(
      {
        id: servicio.id,
        nombre: servicio.nombre,
      },
      'Servicio encontrado por nombre',
    );
    return servicio;
  }

  async update(id: number, dto: UpdateServicioDto) {
    this.logger.info(
      {
        id,
        nombre: dto.nombre,
      },
      'Actualizando servicio',
    );

    await this.findOne(id); // 404 si no existe

    const servicio = await this.prisma.servicio.update({
      where: { id },
      data: {
        ...dto,
        propiedades: dto.propiedades as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.info(
      {
        id: servicio.id,
        nombre: servicio.nombre,
      },
      'Servicio actualizado',
    );

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return servicio;
  }

  async shutdown(id: number) {
    this.logger.debug({ id }, 'Cambiando estado de servicio');

    const existing = await this.findOne(id); // 404 si no existe

    await this.prisma.servicio.update({
      where: { id },
      data: { estatus: !existing.estatus },
    });
    this.logger.info(
      { id, newStatus: !existing.estatus },
      'Estado de servicio cambiado',
    );

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return { updated: true };
  }

  async remove(id: number) {
    this.logger.debug({ id }, 'Eliminando servicio');

    await this.findOne(id); // 404 si no existe

    await this.prisma.servicio.delete({ where: { id } });
    this.logger.info({ id }, 'Servicio eliminado permanentemente');

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return { deleted: true };
  }

  async allExists(ids: number[]) {
    this.logger.debug({ ids }, 'Verificando existencia de servicios por IDs');

    try {
      const cached = await this.redis.get<ServicioExterno[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: 'caché',
            count: cached.length,
          },
          'Servicios obtenidos desde caché',
        );

        const cachedIds = new Set(cached.map((s) => s.id));
        const allExist = ids.every((id) => cachedIds.has(id));

        if (allExist)
          return {
            valid: true,
            missing: [],
          };

        return {
          valid: false,
          missing: ids.filter((id) => !cachedIds.has(id)),
        };
      }
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al obtener servicios desde caché',
      );
    }

    const servicios = await this.prisma.servicio.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.debug(
      {
        source: 'database',
        ids,
        count: servicios.length,
      },
      'Servicios recuperados desde base de datos',
    );

    const allExist = servicios.length === ids.length;
    if (allExist) {
      return {
        valid: true,
        missing: [],
      };
    }

    const foundIds = new Set(servicios.map((s) => s.id));

    return {
      valid: false,
      missing: ids.filter((id) => !foundIds.has(id)),
    };
  }
}
