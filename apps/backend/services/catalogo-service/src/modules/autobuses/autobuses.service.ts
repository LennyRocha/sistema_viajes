/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateAutobusDto } from './dtos/create-autobus.dto';
import { UpdateAutobusDto } from './dtos/update-autobus.dto';
import { Prisma } from '@prisma/client';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import Autobus from './autobus.entity';
import { ServiciosService } from '../servicios/servicios.service';
import slugify from 'slugify';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { Asiento } from './types/Asiento';
import { AutobusEstado } from './types/AutobusEstado';
import { AsientoEstado } from './types/AsientoEstado';

const LIST_CACHE_KEY = 'autobuses:list';

@Injectable()
export class AutobusesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly servicios: ServiciosService,
    @Inject('RECORD_SERVICE')
    private readonly client: ClientProxy,
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
      marca:
        dto.marca.trim().at(0)?.toUpperCase() +
        dto.marca.trim().slice(1).toLowerCase(),
      alias: dto.alias.trim().replace(/\s+/g, ' '),
      modelo: dto.modelo.trim().replace(/\s+/g, ' '),
      ano: dto.ano,
      capacidad: dto.capacidad,
      estado: dto.estado,
      color: dto.color.trim().replace(/\s+/g, ' '),
      descripcion:
        dto.descripcion.at(0)?.toUpperCase() +
        dto.descripcion.slice(1).toLowerCase().trim().replace(/\s+/g, ' '),
      codigo_interno: dto.codigo_interno.trim().replace(/\s+/g, ' '),
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

    this.client.emit('bus.nuevo', this.findAll(true));

    this.logger.info(
      {
        autobusId: autobus.id,
      },
      'Autobus creado',
    );
    return autobus;
  }

  async findAll(active: boolean, tipo_bus = 0, institucion = 0) {
    this.logger.debug('Obteniendo todos los autobuses');

    // 1) ¿está en caché?
    try {
      let cached = await this.redis.get<Autobus[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: 'caché',
            count: cached.length,
          },
          'Autobuses obtenidos desde caché',
        );
        if (active) cached = cached.filter((s) => s.estatus);
        if (tipo_bus !== 0)
          cached = cached.filter((s) => s.tipo_autobus_id === tipo_bus);
        if (institucion !== 0)
          cached = cached.filter((s) => s.institucion_id === institucion);
        return cached;
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

    if (institucion !== 0) {
      where.institucion_id = institucion;
    }

    // 2) no está → base de datos
    const autobuses = await this.prisma.autobus.findMany({
      orderBy: { createdAt: 'desc' },
      where,
      include: {
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
        servicios: {
          where: { servicio: { estatus: true } },
          include: {
            servicio: true,
          },
        },
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
        servicios: {
          where: { servicio: { estatus: true } },
          include: {
            servicio: true,
          },
        },
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
        servicios: {
          where: { servicio: { estatus: true } },
          include: {
            servicio: true,
          },
        },
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
      marca: dto.marca
        ? dto.marca.trim().at(0)?.toUpperCase() +
          dto.marca.trim().slice(1).toLowerCase()
        : existing.marca,
      alias: dto.alias?.trim()?.replace(/\s+/g, ' ') ?? existing.alias,
      modelo: dto.modelo?.trim()?.replace(/\s+/g, ' ') ?? existing.modelo,
      ano: dto.ano ?? existing.ano,
      capacidad: dto.capacidad ?? existing.capacidad,
      estado: dto.estado ?? existing.estado,
      color: dto.color ?? existing.color,
      descripcion: dto.descripcion
        ? dto.descripcion.at(0)?.toUpperCase() +
          dto.descripcion.slice(1).toLowerCase().trim().replace(/\s+/g, ' ')
        : existing.descripcion,
      codigo_interno:
        dto.codigo_interno?.trim()?.replace(/\s+/g, ' ') ??
        existing.codigo_interno,
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

      this.client.emit('bus.updated', this.findAll(true));

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

  // find autobuses salidas
  async findAutobusSalida(id: number) {
    this.logger.debug({ id }, 'Obteniendo autobús para módulo de salidas');

    const autobus = await this.prisma.autobus.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        alias: true,
        codigo_interno: true,
        marca: true,
        modelo: true,
        estatus: true,
        asientos: true,
      },
    });

    if (!autobus) {
      this.logger.warn({ id }, 'Autobús no encontrado');

      throw new NotFoundException(`Autobús ${id} no existe`);
    }

    return {
      id: autobus.id,
      estatus: autobus.estatus,
      nombre: `${autobus.alias} (${autobus.codigo_interno})`,
      marca: autobus.marca,
      modelo: autobus.modelo,
      asientos: autobus.asientos,
    };
  }

  async setAutobusOcupado(id: number, asientosOcupados: Asiento[]) {
    this.logger.debug(
      { id, asientosOcupados },
      'Actualizando asientos ocupados del autobús',
    );
    const existing = await this.findOne(id); // 404 si no existe
    const newAsientos =
      existing.asientos ??
      [].map((asiento: Asiento) => {
        const ocupado = asientosOcupados.find((a) => a.id === asiento.id);
        if (ocupado) {
          return {
            ...asiento,
            estado: ocupado.estado,
          };
        }
        return asiento;
      });
    await this.prisma.autobus.update({
      where: { id },
      data: {
        asientos: newAsientos as unknown as Prisma.InputJsonValue,
      },
    });
    this.logger.info(
      { id, asientosOcupados },
      'Asientos ocupados del autobús actualizados',
    );
    return { ocupados: true };
  }

  async setAutobusDesocupado(id: number) {
    this.logger.debug({ id }, 'Liberando los asientos del autobús');
    const existing = await this.findOne(id); // 404 si no existe
    if (!existing.asientos) {
      this.logger.warn({ id }, 'No se encontraron asientos para liberar');
      return { desocupados: false };
    } else {
      const newAsientos =
        existing.asientos ??
        [].map((asiento: Asiento) => ({
          ...asiento,
          estado: AsientoEstado.AVAILABLE,
        }));
      await this.prisma.autobus.update({
        where: { id },
        data: {
          asientos: newAsientos,
          estado: AutobusEstado.DISPONIBLE,
        },
      });
      this.logger.info({ id }, 'Asientos del autobús liberados');
      return { desocupados: true };
    }
  }

  async setAutobusEnRuta(id: number) {
    this.logger.debug({ id }, 'Cambiando estado del autobús a EN_RUTA');
    await this.findOne(id); // 404 si no existe
    await this.prisma.autobus.update({
      where: { id },
      data: {
        estado: AutobusEstado.EN_RUTA,
      },
    });
    this.logger.info({ id }, 'Estado del autobús cambiado a EN_RUTA');
    return { enRuta: true };
  }

  async setAutobusEnMantenimiento(id: number) {
    this.logger.debug(
      { id },
      'Cambiando estado del autobús a EN_MANTENIMIENTO',
    );
    await this.findOne(id);
    await this.prisma.autobus.update({
      where: { id },
      data: {
        estado: AutobusEstado.EN_MANTENIMIENTO,
      },
    });
    this.logger.info({ id }, 'Estado del autobús cambiado a EN_MANTENIMIENTO');
    return { enMantenimiento: true };
  }

  async setAutobusFueraDeServicio(id: number) {
    this.logger.debug(
      { id },
      'Cambiando estado del autobús a FUERA_DE_SERVICIO',
    );
    await this.findOne(id);
    await this.prisma.autobus.update({
      where: { id },
      data: {
        estado: AutobusEstado.FUERA_DE_SERVICIO,
      },
    });
    this.logger.info({ id }, 'Estado del autobús cambiado a FUERA_DE_SERVICIO');
    return { fueraDeServicio: true };
  }
}
