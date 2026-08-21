import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActividadReporteDto } from './dto/create-actividad-reporte.dto';
import { QueryActividadReporteDto } from './dto/query-actividad-reporte.dto';

const SENSITIVE_KEY =
  /password|contrasena|contra|token|authorization|cookie|secret|credential/i;

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[PROFUNDIDAD_LIMITADA]';
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitize(item, depth + 1));
  }
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' && value.length > 1000
      ? `${value.slice(0, 1000)}...`
      : value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE_KEY.test(key))
      .slice(0, 100)
      .map(([key, item]) => [key, sanitize(item, depth + 1)]),
  );
}

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  createActividad(dto: CreateActividadReporteDto) {
    const detalles = dto.detalles ? sanitize(dto.detalles) : undefined;
    return this.prisma.actividadReporte.create({
      data: {
        ...dto,
        roles: dto.roles ?? [],
        detalles: detalles as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findActividad(query: QueryActividadReporteDto) {
    const search = query.search?.trim();
    const fecha: Prisma.DateTimeFilter | undefined =
      query.desde || query.hasta
        ? {
            ...(query.desde ? { gte: new Date(query.desde) } : {}),
            ...(query.hasta
              ? { lte: new Date(`${query.hasta.slice(0, 10)}T23:59:59.999Z`) }
              : {}),
          }
        : undefined;

    const where: Prisma.ActividadReporteWhereInput = {
      ...(query.categoria ? { categoria: query.categoria } : {}),
      ...(query.resultado ? { resultado: query.resultado } : {}),
      ...(query.evento ? { evento: query.evento } : {}),
      ...(query.modulo ? { modulo: query.modulo } : {}),
      ...(fecha ? { fecha } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { evento: { contains: search, mode: 'insensitive' } },
              { modulo: { contains: search, mode: 'insensitive' } },
              { mensaje: { contains: search, mode: 'insensitive' } },
              { ruta: { contains: search, mode: 'insensitive' } },
              { ip: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const skip = (query.page - 1) * query.pageSize;
    const [items, total, exitos, fallos, denegados] = await this.prisma.$transaction([
      this.prisma.actividadReporte.findMany({
        where,
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        skip,
        take: query.pageSize,
      }),
      this.prisma.actividadReporte.count({ where }),
      this.prisma.actividadReporte.count({
        where: { AND: [where, { resultado: 'EXITO' }] },
      }),
      this.prisma.actividadReporte.count({
        where: { AND: [where, { resultado: 'FALLO' }] },
      }),
      this.prisma.actividadReporte.count({
        where: { AND: [where, { resultado: 'DENEGADO' }] },
      }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
      summary: {
        total,
        exitos,
        fallos,
        denegados,
      },
    };
  }
}
