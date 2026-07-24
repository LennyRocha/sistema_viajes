/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateAutobusDto } from './dtos/create-autobus.dto';
import { UpdateAutobusDto } from './dtos/update-autobus.dto';
import { Prisma } from '@prisma/client';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import Autobus from './autobus.entity';
import { InstitucionesService } from '../instituciones/instituciones.service';
import { ServiciosService } from '../servicios/servicios.service';
import { TiposAutobusService } from '../tipos_autobus/tipo_bus.service';
import slugify from 'slugify';

const LIST_CACHE_KEY = 'servicios:list';

@Injectable()
export class AutobusesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly instituciones: InstitucionesService,
    private readonly servicios: ServiciosService,
    private readonly tipos: TiposAutobusService,
    @InjectPinoLogger(AutobusesService.name)
    private readonly logger: PinoLogger,
  ) {}

  async create(dto: CreateAutobusDto) {
    this.logger.info(
      {
        alias: dto.alias,
      },
      'Creando autobús',
    );

    const { valid, missing } = await this.servicios.allExists(
      dto.servicios.map((s) => s.servicio_id),
    );
    if (!valid) {
      this.logger.warn(
        {
          missing,
          count: missing.length,
        },
        'Servicios no encontrados',
      );
      throw new NotFoundException(
        `Servicios no encontrados: ${missing.join(', ')}`,
      );
    }

    const payloadExceptServicios: Prisma.AutobusCreateInput = {
      marca: dto.marca,
      alias: dto.alias,
      modelo: dto.modelo,
      ano: dto.ano,
      capacidad: dto.capacidad,
      estado: dto.estado,
      color: dto.color,
      descripcion: dto.descripcion,
      codigo_interno: dto.codigo_interno,
      institucion: {
        connect: {
          id: dto.institucion_id,
        },
      },
      tipoAutobus: {
        connect: {
          id: dto.tipo_autobus_id,
        },
      },
      asientos: dto.asientos as unknown as Prisma.InputJsonValue,
      slug: slugify(dto.alias, { lower: true }),
    };

    const autobus = await this.prisma.autobus.create({
      data: {
        ...payloadExceptServicios,
        servicios: {
          create: dto.servicios.map((s) => ({
            servicio_id: s.servicio_id,
            config_servicio: s.config_servicio as Prisma.InputJsonValue,
          })),
        },
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
        autobusId: autobus.id,
      },
      'Autobus creado',
    );
    return autobus;
  }

  async findAll(active: boolean, tipo_bus = 0) {
    this.logger.debug('Obteniendo todos los autobuses');

    // 1) ¿está en caché?
    try {
      const cached = await this.redis.get<Autobus[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: 'caché',
            count: cached.length,
          },
          'Autobuses obtenidos desde caché',
        );
        return active ? cached.filter((s) => s.estatus) : cached;
      }
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al obtener autobuses desde caché',
      );
    }

    const where: Prisma.AutobusWhereInput = active
      ? {
          estatus: true,
        }
      : {};

    if (tipo_bus !== 0) {
      where.tipo_autobus_id = tipo_bus;
    }

    // 2) no está → base de datos
    const autobuses = await this.prisma.autobus.findMany({
      orderBy: { createdAt: 'desc' },
      where,
      include: {
        asientos: true,
        servicios: true,
        tipoAutobus: true,
        institucion: true,
      },
    });

    // 3) guarda para la próxima (30 minutos)
    try {
      await this.redis.set(LIST_CACHE_KEY, autobuses, 30 * 60); // 30 minutos
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al guardar autobuses en caché',
      );
    }

    this.logger.debug(
      {
        source: 'database',
        count: autobuses.length,
      },
      'Autobuses obtenidos desde base de datos y guardados en caché',
    );
    return autobuses;
  }

  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo autobus por ID');

    const autobus = await this.prisma.autobus.findUnique({
      include: {
        asientos: true,
        servicios: true,
        tipoAutobus: true,
        institucion: true,
      },
      where: { id },
    });

    if (!autobus) {
      this.logger.warn(
        {
          id,
        },
        'Autobus no encontrado',
      );
      throw new NotFoundException(`Autobus ${id} no existe`);
    }

    this.logger.info(
      {
        id,
        alias: autobus.alias,
        asientos: autobus.asientos,
        codigo_interno: autobus.codigo_interno,
      },
      'Autobus encontrado',
    );
    return autobus;
  }

  async findOneByCodigoInterno(codigo_interno: string) {
    this.logger.debug(
      { codigo_interno },
      'Obteniendo autobus por código interno',
    );

    const autobus = await this.prisma.autobus.findUnique({
      include: {
        asientos: true,
        servicios: true,
        tipoAutobus: true,
        institucion: true,
      },
      where: { codigo_interno },
    });

    if (!autobus) {
      this.logger.warn(
        {
          codigo_interno,
        },
        'Autobus no encontrado por código interno',
      );
      throw new NotFoundException(`Autobus ${codigo_interno} no existe`);
    }

    this.logger.info(
      {
        id: autobus.id,
        alias: autobus.alias,
        asientos: autobus.asientos,
        codigo_interno: autobus.codigo_interno,
      },
      'Autobus encontrado por código interno',
    );
    return autobus;
  }

  async findOneByAlias(alias: string) {
    this.logger.debug({ alias }, 'Obteniendo autobus por alias');

    const autobus = await this.prisma.autobus.findUnique({
      include: {
        asientos: true,
        servicios: true,
        tipoAutobus: true,
        institucion: true,
      },
      where: { slug: slugify(alias, { lower: true }) },
    });

    if (!autobus) {
      this.logger.warn(
        {
          slugify: slugify(alias, { lower: true }),
        },
        'Autobus no encontrado por alias',
      );
      throw new NotFoundException(`Autobus ${alias} no existe`);
    }

    this.logger.info(
      {
        id: autobus.id,
        alias: autobus.alias,
        asientos: autobus.asientos,
        codigo_interno: autobus.codigo_interno,
      },
      'Autobus encontrado por alias',
    );
    return autobus;
  }

  async update(id: number, dto: UpdateAutobusDto) {
    this.logger.info(
      {
        autobusId: id,
        alias: dto.alias,
      },
      'Actualizando autobús',
    );

    const existing = await this.findOne(id); // 404 si no existe

    if (dto.servicios) {
      const { valid, missing } = await this.servicios.allExists(
        dto?.servicios?.map((s) => s.servicio_id),
      );

      if (!valid) {
        this.logger.warn(
          {
            missing,
            count: missing.length,
          },
          'Servicios no encontrados',
        );

        throw new NotFoundException(
          `Servicios no encontrados: ${missing.join(', ')}`,
        );
      }
    }

    const payloadExceptServicios: Prisma.AutobusUpdateInput = {
      marca: dto.marca ?? existing.marca,
      alias: dto.alias ?? existing.alias,
      modelo: dto.modelo ?? existing.modelo,
      ano: dto.ano ?? existing.ano,
      capacidad: dto.capacidad ?? existing.capacidad,
      estado: dto.estado ?? existing.estado,
      color: dto.color ?? existing.color,
      descripcion: dto.descripcion ?? existing.descripcion,
      codigo_interno: dto.codigo_interno ?? existing.codigo_interno,
      institucion: {
        connect: {
          id: dto.institucion_id ?? existing.institucion_id,
        },
      },
      tipoAutobus: {
        connect: {
          id: dto.tipo_autobus_id ?? existing.tipo_autobus_id,
        },
      },
      asientos: dto.asientos
        ? (dto.asientos as unknown as Prisma.InputJsonValue)
        : (existing.asientos as unknown as Prisma.InputJsonValue),
      slug: dto.alias ? slugify(dto.alias, { lower: true }) : existing.slug,
    };

    const autobus = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.autobus.update({
        where: { id },
        data: { ...payloadExceptServicios },
      });

      if (dto.servicios) {
        await tx.autobusServicio.deleteMany({
          where: {
            autobus_id: id,
          },
        });

        await tx.autobusServicio.createMany({
          data: dto.servicios.map((s) => ({
            autobus_id: id,
            servicio_id: s.servicio_id,
            config_servicio: s.config_servicio as Prisma.InputJsonValue,
          })),
        });
      }

      return updated;
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
        autobusId: autobus.id,
      },
      'Autobús actualizado',
    );

    return autobus;
  }

  async shutdown(id: number) {
    this.logger.debug({ id }, 'Cambiando estado de autobus');

    const existing = await this.findOne(id); // 404 si no existe

    await this.prisma.autobus.update({
      where: { id },
      data: { estatus: !existing.estatus },
    });
    this.logger.info(
      { id, newStatus: !existing.estatus },
      'Estado de autobus cambiado',
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
    this.logger.debug({ id }, 'Eliminando autobus permanentemente');

    await this.findOne(id); // 404 si no existe

    await this.prisma.autobus.delete({ where: { id } });
    this.logger.info({ id }, 'Autobus eliminado permanentemente');

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
}
