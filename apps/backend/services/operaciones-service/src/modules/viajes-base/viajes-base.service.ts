import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { ConfiguracionesService } from '../configuraciones/configuraciones.service';
import { GeoPoint, distanceMeters } from '../geo/geo.utils';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateViajeBaseDto } from './dtos/create-viaje-base.dto';
import { UpdateViajeBaseDto } from './dtos/update-viaje-base.dto';
import { ViajeBaseRutaDto } from './dtos/viaje-base-ruta.dto';

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function sortRutas(rutas: ViajeBaseRutaDto[]) {
  return [...rutas].sort((a, b) => a.orden - b.orden);
}

type ConexionValidada = {
  desdeRutaId: number;
  hastaRutaId: number;
  distanciaMetros: number;
  toleranciaMetros: number;
  conectado: boolean;
  requiereConexion: boolean;
};

type FindAllOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

@Injectable()
export class ViajesBaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configuraciones: ConfiguracionesService,
  ) {}

  async create(dto: CreateViajeBaseDto) {
    const rutasOrdenadas = sortRutas(dto.rutas);
    await this.assertRutasExist(rutasOrdenadas.map((ruta) => ruta.rutaId));
    const segmentos = await this.buildSegmentos(rutasOrdenadas);

    return this.prisma.viajeBase.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        frecuencia: dto.frecuencia,
        duracionCalculadaMin: dto.duracionCalculadaMin,
        margenMin: dto.margenMin ?? 0,
        duracionTotalMin:
          dto.duracionTotalMin ??
          ((dto.duracionCalculadaMin ?? 0) + (dto.margenMin ?? 0)),
        imagenUrl: dto.imagenUrl,
        imagenBase64: dto.imagenBase64,
        imagenStorage: dto.imagenStorage,
        estatus: dto.estatus ?? true,
        rutas: {
          create: segmentos,
        },
      },
      include: this.includeRutas(),
    });
  }

  async findAll(active: boolean, options: FindAllOptions = {}) {
    const search = options.search?.trim();
    const where: Prisma.ViajeBaseWhereInput = {
      ...(active ? { estatus: true } : {}),
      ...(search
        ? {
            OR: [
              { nombre: { contains: search, mode: 'insensitive' } },
              { descripcion: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    if (!options.page && !options.limit && !search) {
      return this.prisma.viajeBase.findMany({
        where,
        include: this.includeRutas(),
        orderBy: { createdAt: 'desc' },
      });
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 5));
    const [data, total] = await this.prisma.$transaction([
      this.prisma.viajeBase.findMany({
        where,
        include: this.includeRutas(),
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.viajeBase.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number) {
    const viaje = await this.prisma.viajeBase.findUnique({
      where: { id },
      include: this.includeRutas(),
    });

    if (!viaje) {
      throw new NotFoundException(`Viaje base ${id} no existe`);
    }

    return viaje;
  }

  async update(id: number, dto: UpdateViajeBaseDto) {
    await this.findOne(id);

    const rutas = dto.rutas ? sortRutas(dto.rutas) : undefined;
    if (rutas) {
      await this.assertRutasExist(rutas.map((ruta) => ruta.rutaId));
    }

    return this.prisma.$transaction(async (tx) => {
      if (rutas) {
        await tx.viajeBaseRuta.deleteMany({ where: { viajeBaseId: id } });
      }

      return tx.viajeBase.update({
        where: { id },
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          frecuencia: dto.frecuencia,
          duracionCalculadaMin: dto.duracionCalculadaMin,
          margenMin: dto.margenMin,
          duracionTotalMin: dto.duracionTotalMin,
          imagenUrl: dto.imagenUrl,
          imagenBase64: dto.imagenBase64,
          imagenStorage: dto.imagenStorage,
          estatus: dto.estatus,
          rutas: rutas
            ? {
                create: await this.buildSegmentos(rutas),
              }
            : undefined,
        },
        include: this.includeRutas(),
      });
    });
  }

  async shutdown(id: number) {
    const viaje = await this.findOne(id);

    return this.prisma.viajeBase.update({
      where: { id },
      data: { estatus: !viaje.estatus },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.viajeBase.delete({ where: { id } });
  }

  async validar(rutaIds: number[]) {
    const rutasOrdenadas = rutaIds.map((rutaId, index) => ({
      rutaId,
      orden: index + 1,
    }));

    await this.assertRutasExist(rutaIds);
    return this.buildValidacion(rutasOrdenadas);
  }

  private includeRutas() {
    return {
      rutas: {
        include: { ruta: true },
        orderBy: { orden: 'asc' as const },
      },
    };
  }

  private async assertRutasExist(rutaIds: number[]) {
    const uniqueIds = Array.from(new Set(rutaIds));
    const count = await this.prisma.ruta.count({
      where: { id: { in: uniqueIds } },
    });

    if (count !== uniqueIds.length) {
      throw new BadRequestException('Una o mas rutas no existen');
    }
  }

  private async buildSegmentos(rutas: ViajeBaseRutaDto[]) {
    const validacion = await this.buildValidacion(rutas);

    return rutas.map((ruta, index) => {
      const conexion = validacion.conexiones[index - 1];
      return {
        ruta: { connect: { id: ruta.rutaId } },
        orden: ruta.orden,
        conexion: ruta.conexion ? toJson(ruta.conexion) : undefined,
        conexionEncodedPolyline: ruta.conexionEncodedPolyline,
        distanciaConexionMetros:
          ruta.distanciaConexionMetros ?? conexion?.distanciaMetros,
        requiereConexion: conexion?.requiereConexion ?? false,
      };
    });
  }

  private async buildValidacion(rutas: ViajeBaseRutaDto[]) {
    const toleranciaMetros =
      await this.configuraciones.getToleranciaConexionMetros();
    const entities = await this.prisma.ruta.findMany({
      where: { id: { in: rutas.map((ruta) => ruta.rutaId) } },
    });
    const byId = new Map(entities.map((ruta) => [ruta.id, ruta]));
    const conexiones: ConexionValidada[] = [];

    for (let index = 1; index < rutas.length; index += 1) {
      const anterior = byId.get(rutas[index - 1].rutaId);
      const actual = byId.get(rutas[index].rutaId);
      if (!anterior || !actual) continue;

      const distancia = distanceMeters(
        anterior.destino as GeoPoint,
        actual.origen as GeoPoint,
      );

      conexiones.push({
        desdeRutaId: anterior.id,
        hastaRutaId: actual.id,
        distanciaMetros: distancia,
        toleranciaMetros,
        conectado: distancia <= toleranciaMetros,
        requiereConexion: distancia > toleranciaMetros,
      });
    }

    return {
      toleranciaMetros,
      valido: conexiones.every((conexion) => conexion.conectado),
      conexiones,
    };
  }
}
