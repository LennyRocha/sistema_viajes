/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import {
  DisponibilidadPorInstitucion,
  DisponibilidadPorServicio,
  DisponibilidadPorTipo,
} from './types/disponibilidad-responses';
import { Prisma } from '@prisma/client';

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

    await this.prisma.disponibilidadServicio.update({
      where: { id },
      data: { activo: !existing.activo },
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

  async findAllByInstitucion(
    institucionId: number,
    showActiveOnly: boolean = true,
  ) {
    this.logger.debug(
      { institucionId },
      'Obteniendo disponibilidades de servicios por institución',
    );

    const institucion = await this.instituciones.findOne(institucionId); // 404 si no existe

    const where: Prisma.DisponibilidadServicioWhereInput = {
      institucion_id: institucionId,
    };

    if (showActiveOnly) {
      where.activo = true;
    }

    const list = await this.prisma.disponibilidadServicio.findMany({
      where,
      include: {
        servicio: true,
        tipo_autobus: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data: DisponibilidadPorInstitucion[] = [];

    const serviciosUnicos = new Map(
      list.map((d) => [d.servicio.id, d.servicio]),
    );
    for (const value of serviciosUnicos.values()) {
      data.push({
        servicio: value,
        tipos: list
          .filter((d) => d.servicio_id === value.id)
          .map((d) => d.tipo_autobus),
      });
    }

    this.logger.info(
      {
        institucionId,
        institucionNombre: institucion.nombre,
        count: serviciosUnicos.size,
      },
      'Disponibilidades de servicios obtenidas por institución',
    );
    return data.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      ids: list
        .filter((l) => l.servicio_id === d.servicio.id)
        .map((l) => ({
          id: l.id,
          linea: l.tipo_autobus.linea,
          activo: l.activo,
        })),
    }));
  }

  async findAllByServicio(servicioId: number, showActiveOnly: boolean = true) {
    this.logger.debug(
      { servicioId },
      'Obteniendo disponibilidades de servicios por servicio',
    );

    const servicio = await this.servicios.findOne(servicioId); // 404 si no existe

    const where: Prisma.DisponibilidadServicioWhereInput = {
      servicio_id: servicioId,
    };

    if (showActiveOnly) {
      where.activo = true;
    }

    const list = await this.prisma.disponibilidadServicio.findMany({
      where,
      include: {
        institucion: true,
        tipo_autobus: true,
        servicio: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data: DisponibilidadPorServicio[] = [];

    const institucionesUnicas = new Map(
      list.map((d) => [d.institucion.id, d.institucion]),
    );

    for (const value of institucionesUnicas.values()) {
      data.push({
        institucion: value,
        tipos: list
          .filter((d) => d.institucion_id === value.id)
          .map((d) => d.tipo_autobus), // fix del campo
      });
    }

    this.logger.info(
      {
        servicioId,
        servicioNombre: servicio.nombre,
        count: institucionesUnicas.size,
      },
      'Disponibilidades de servicios obtenidas por servicio',
    );
    return data.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      ids: list
        .filter((l) => l.institucion_id === d.institucion.id)
        .map((l) => ({
          id: l.id,
          linea: l.tipo_autobus.linea,
          activo: l.activo,
        })),
    }));
  }

  async findAllByTipo(tipoBusId: number, showActiveOnly: boolean = true) {
    this.logger.debug(
      { tipoBusId },
      'Obteniendo disponibilidades de servicios por tipo de autobús',
    );

    const tipoAutobus = await this.tipos.findOne(tipoBusId); // 404 si no existe

    const where: Prisma.DisponibilidadServicioWhereInput = {
      tipo_autobus_id: tipoBusId,
    };

    if (showActiveOnly) {
      where.activo = true;
    }

    const list = await this.prisma.disponibilidadServicio.findMany({
      where,
      include: {
        servicio: true,
        institucion: true,
        tipo_autobus: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data: DisponibilidadPorTipo[] = [];

    const institucionesUnicas = new Map(
      list.map((d) => [d.institucion.id, d.institucion]),
    );

    for (const value of institucionesUnicas.values()) {
      data.push({
        institucion: value,
        servicios: list
          .filter((d) => d.institucion_id === value.id)
          .map((d) => d.servicio),
      });
    }

    this.logger.info(
      {
        tipoBusId,
        tipoBusNombre: tipoAutobus.nombre,
        count: institucionesUnicas.size,
      },
      'Disponibilidades de servicios obtenidas por tipo de autobús',
    );
    return data.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      ids: list
        .filter((l) => l.institucion_id === d.institucion.id)
        .map((l) => ({
          id: l.id,
          servicio: l.servicio.nombre,
          activo: l.activo,
        })),
    }));
  }

  async findServiciosDisponibles(tipoBusId: number, institucionId: number) {
    this.logger.debug(
      { tipoBusId, institucionId },
      'Obteniendo servicios disponibles por tipo de autobús e institución',
    );

    if (!tipoBusId || !institucionId) {
      return await this.servicios.findAll();
    }

    // 404 si no existen
    const [tipoAutobus, institucion] = await Promise.all([
      this.tipos.findOne(tipoBusId),
      this.instituciones.findOne(institucionId),
    ]);

    const [todosLosServicios, disponibilidades] = await Promise.all([
      this.prisma.servicio.findMany({ where: { estatus: true } }),
      this.prisma.disponibilidadServicio.findMany({
        where: { activo: true },
        select: {
          servicio_id: true,
          tipo_autobus_id: true,
          institucion_id: true,
        },
      }),
    ]);

    // ¿existe alguna restricción configurada exactamente para esta combinación tipo+institución?
    const combinacionTieneRestricciones = disponibilidades.some(
      (d) =>
        d.tipo_autobus_id === tipoBusId && d.institucion_id === institucionId,
    );

    // si nadie configuró restricciones para esta combinación específica, no hay exclusividad que aplicar
    if (!combinacionTieneRestricciones) {
      this.logger.info(
        {
          tipoBusId,
          institucionId,
          tipoBusNombre: tipoAutobus.nombre,
          institucionNombre: institucion.nombre,
          count: todosLosServicios.length,
        },
        'Sin restricciones configuradas para esta combinación, devolviendo todos los servicios',
      );
      return todosLosServicios;
    }

    // servicios que tienen ALGUNA restricción de exclusividad (en cualquier combinación)
    const serviciosConRestriccion = new Set(
      disponibilidades.map((d) => d.servicio_id),
    );

    // servicios sin ninguna restricción configurada (disponibles siempre)
    const serviciosSinRestriccion = todosLosServicios.filter(
      (s) => !serviciosConRestriccion.has(s.id),
    );

    // servicios cuya restricción coincide exactamente con este tipo + institución
    const serviciosCoincidentes = new Set(
      disponibilidades
        .filter(
          (d) =>
            d.tipo_autobus_id === tipoBusId &&
            d.institucion_id === institucionId,
        )
        .map((d) => d.servicio_id),
    );

    const data = todosLosServicios.filter((s) =>
      serviciosCoincidentes.has(s.id),
    );

    this.logger.info(
      {
        tipoBusId,
        institucionId,
        tipoBusNombre: tipoAutobus.nombre,
        institucionNombre: institucion.nombre,
        count: data.length + serviciosSinRestriccion.length,
      },
      'Servicios disponibles obtenidos por tipo de autobús e institución',
    );

    return [...serviciosSinRestriccion, ...data].sort((a, b) => a.id - b.id);
  }
}
