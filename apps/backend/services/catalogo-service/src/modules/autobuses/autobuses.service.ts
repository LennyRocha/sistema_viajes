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

  async create(dto: CreateAutobusDto) {}

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
        nombre: autobus.alias,
        codigo_interno: autobus.codigo_interno,
      },
      'Autobus encontrado',
    );
    return autobus;
  }

  async findOneByCodigoInterno(codigo_interno: string) {}
  async findOneByAlias(alias: string) {}
  async update(id: number, dto: UpdateAutobusDto) {}
  async shutdown(id: number) {}
  async remove(id: number) {}
}
