/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { Institucion } from './institucion.entity';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

const LIST_CACHE_KEY = 'instituciones:list';

@Injectable()
export class InstitucionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectPinoLogger(InstitucionesService.name)
    private readonly logger: PinoLogger,
  ) {}

  async findAll() {
    this.logger.debug('Obteniendo todas las instituciones');

    // 1) ¿está en caché?
    try {
      const cached = await this.redis.get<Institucion[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: 'caché',
            count: cached.length,
          },
          'Instituciones obtenidas desde caché',
        );
        return cached;
      }
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al obtener instituciones desde caché',
      );
    }

    // 2) no está → base de datos
    const instituciones = await this.prisma.institucion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 3) guarda para la próxima (1 hora = 3600 segundos)
    try {
      await this.redis.set(LIST_CACHE_KEY, instituciones, 60 * 60); // 1 hora
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al guardar instituciones en caché',
      );
    }

    this.logger.debug(
      {
        source: 'database',
        count: instituciones.length,
      },
      'Instituciones obtenidas desde base de datos y guardadas en caché',
    );
    return instituciones;
  }

  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo institución por ID');

    const institucion = await this.prisma.institucion.findUnique({
      where: { id },
    });

    if (!institucion) {
      this.logger.warn(
        {
          id,
        },
        'Institución no encontrada',
      );
      throw new NotFoundException(`Institución ${id} no existe`);
    }

    this.logger.info(
      {
        id,
        nombre: institucion.nombre,
      },
      'Institución encontrada',
    );
    return institucion;
  }
}
