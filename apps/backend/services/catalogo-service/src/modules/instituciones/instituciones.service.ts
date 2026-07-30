/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { Institucion } from './institucion.entity';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { CreateInstitucionDto } from './dtos/create-institucion.dto';
import { UpdateInstitucionDto } from './dtos/update-insticuion.dto';
import slugify from 'slugify';
import { Prisma } from '@prisma/client';

const LIST_CACHE_KEY = 'instituciones:list';

@Injectable()
export class InstitucionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectPinoLogger(InstitucionesService.name)
    private readonly logger: PinoLogger,
  ) {}

  async create(dto: CreateInstitucionDto) {
    this.logger.info(
      {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
      'Creando institución',
    );

    const institucion = await this.prisma.institucion.create({
      data: {
        ...dto,
        slug: slugify(dto.nombre, { lower: true }),
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
        institucionId: institucion.id,
      },
      'Institución creada',
    );
    return institucion;
  }

  async findAll(active: boolean) {
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
        return active ? cached.filter((i) => i.estatus) : cached;
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

    const where: Prisma.InstitucionWhereInput = active
      ? {
          estatus: true,
        }
      : {};

    // 2) no está → base de datos
    const instituciones = await this.prisma.institucion.findMany({
      orderBy: { createdAt: 'desc' },
      where,
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

  async findOneByName(name: string) {
    this.logger.debug({ name }, 'Obteniendo institución por nombre');

    const institucion = await this.prisma.institucion.findUnique({
      where: { slug: slugify(name, { lower: true }) },
    });

    if (!institucion) {
      this.logger.warn(
        {
          name,
        },
        'Institución no encontrada',
      );
      throw new NotFoundException(`Institución ${name} no existe`);
    }

    this.logger.info(
      {
        id: institucion.id,
        nombre: institucion.nombre,
      },
      'Institución encontrada',
    );
    return institucion;
  }

  async update(id: number, dto: UpdateInstitucionDto) {
    this.logger.info(
      {
        id,
        nombre: dto.nombre,
      },
      'Actualizando institución',
    );

    const { slug } = await this.findOne(id); // 404 si no existe

    const institucion = await this.prisma.institucion.update({
      where: { id },
      data: {
        ...dto,
        slug: dto.nombre ? slugify(dto.nombre, { lower: true }) : slug,
      },
    });

    this.logger.info(
      {
        id: institucion.id,
        nombre: institucion.nombre,
      },
      'Institución actualizada',
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

    return institucion;
  }

  async shutdown(id: number) {
    this.logger.debug({ id }, 'Cambiando estado de institución');

    const existing = await this.findOne(id); // 404 si no existe

    await this.prisma.institucion.update({
      where: { id },
      data: { estatus: !existing.estatus },
    });
    this.logger.info(
      { id, newStatus: !existing.estatus },
      'Estado de institución cambiado',
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
    this.logger.debug({ id }, 'Eliminando institución');

    await this.findOne(id); // 404 si no existe

    await this.prisma.institucion.delete({ where: { id } });
    this.logger.info({ id }, 'Institución eliminada permanentemente');

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
