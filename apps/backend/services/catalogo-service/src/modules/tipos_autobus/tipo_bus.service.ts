/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { TipoAutobus } from './tipo_bus.entity';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

const LIST_CACHE_KEY = 'tipos_bus:list';

@Injectable()
export class TiposAutobusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectPinoLogger(TiposAutobusService.name)
    private readonly logger: PinoLogger,
  ) {}

  async findAll() {
    this.logger.debug('Obteniendo todos los tipos de autobuses');

    // 1) ¿está en caché?
    try {
      const cached = await this.redis.get<TipoAutobus[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: 'caché',
            count: cached.length,
          },
          'Tipos de autobuses obtenidos desde caché',
        );
        return cached;
      }
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al obtener tipos de autobuses desde caché',
      );
    }

    // 2) no está → base de datos
    const tiposBuses = await this.prisma.tipoAutobus.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 3) guarda para la próxima (30 segundos)
    try {
      await this.redis.set(LIST_CACHE_KEY, tiposBuses, 86400); // 1 día
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al guardar tipos de autobuses en caché',
      );
    }

    this.logger.debug(
      {
        source: 'database',
        count: tiposBuses.length,
      },
      'Tipos de autobuses obtenidos desde base de datos y guardados en caché',
    );
    return tiposBuses;
  }

  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo tipo de autobús por ID');

    const tipoBus = await this.prisma.tipoAutobus.findUnique({
      where: { id },
    });

    if (!tipoBus) {
      this.logger.warn(
        {
          id,
        },
        'Tipo de autobús no encontrado',
      );
      throw new NotFoundException(`Tipo de autobús ${id} no existe`);
    }

    this.logger.info(
      {
        id,
        nombre: tipoBus.nombre,
      },
      'Tipo de autobús encontrado',
    );
    return tipoBus;
  }
}
