/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { SetDisponibilidadDto } from './dto/set-disponibildad.dto';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import DisponibilidadServicio from './disponibilidad-servicio.entity';
import { InstitucionesService } from '../instituciones/instituciones.service';
import { TiposAutobusService } from '../tipos_autobus/tipo_bus.service';
import { ServiciosService } from '../servicios/servicios.service';

const LIST_CACHE_KEY = 'disponibilidad_servicios:list';

@Injectable()
export class DisponibilidadServiciosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly instituciones: InstitucionesService,
    private readonly tipos: TiposAutobusService,
    private readonly servicios: ServiciosService,
    @InjectPinoLogger(DisponibilidadServiciosService.name)
    private readonly logger: PinoLogger,
  ) {}

  async create(dto: SetDisponibilidadDto) {
    this.logger.info(
      {
        dto,
      },
      'Creando servicio',
    );

    this.logger.debug('Buscando si existe el tipo de autobús'); //404 si no existe
    await this.tipos.findOne(dto.tipoId);

    this.logger.debug('Buscando si existe la institución'); //404 si no existe
    await this.instituciones.findOne(dto.institucionId);

    this.logger.debug('Buscando si existe el servicio'); //404 si no existe
    await this.servicios.findOne(dto.servicioId);

    const disp = await this.prisma.disponibilidadServicio.create({
      data: {
        tipo_autobus_id: dto.tipoId,
        institucion_id: dto.institucionId,
        servicio_id: dto.servicioId,
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
        servicioId: disp.id,
      },
      'Disponibilidad de servicio establecida',
    );
    return disp;
  }

  async findAll() {
    this.logger.debug('Obteniendo todos las disponibilidades de servicios');

    try {
      const cached =
        await this.redis.get<DisponibilidadServicio[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: 'caché',
            count: cached.length,
          },
          'Disponibilidades de servicios obtenidas desde caché',
        );
        return cached;
      }
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al obtener disponibilidades de servicios desde caché',
      );
    }

    const disponibilidades = await this.prisma.disponibilidadServicio.findMany({
      orderBy: { createdAt: 'desc' },
    });

    try {
      await this.redis.set(LIST_CACHE_KEY, disponibilidades, 60 * 10); // 10 minutos
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al guardar disponibilidades de servicios en caché',
      );
    }

    this.logger.debug(
      {
        source: 'database',
        count: disponibilidades.length,
      },
      'Disponibilidades de servicios obtenidas desde base de datos y guardadas en caché',
    );
    return disponibilidades;
  }

  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo disponibilidad de servicio por ID');

    const disponibilidad = await this.prisma.disponibilidadServicio.findUnique({
      where: { id },
    });

    if (!disponibilidad) {
      this.logger.warn(
        {
          id,
        },
        'Disponibilidad de servicio no encontrada',
      );
      throw new NotFoundException(`Disponibilidad de servicio ${id} no existe`);
    }

    this.logger.info(
      {
        id,
        tipoAutobus: disponibilidad.tipo_autobus_id,
        institucion: disponibilidad.institucion_id,
        servicio: disponibilidad.servicio_id,
        estado: disponibilidad.activo ? 'activo' : 'inactivo',
      },
      'Disponibilidad de servicio encontrada',
    );
    return disponibilidad;
  }

  async shutdown(id: number) {
    this.logger.debug(
      { id },
      'Cambiando estado de la disponibilidad de servicio',
    );

    const existing = await this.findOne(id); // 404 si no existe

    await this.prisma.servicio.update({
      where: { id },
      data: { estatus: !existing.activo },
    });
    this.logger.info(
      { id, newStatus: !existing.activo },
      `${!existing.activo ? 'Activando' : 'Desactivando'} disponibilidad de servicio
      `,
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
}
