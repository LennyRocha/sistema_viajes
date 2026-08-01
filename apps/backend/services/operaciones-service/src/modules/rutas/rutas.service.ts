import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma as PrismaTypes } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRutaDto } from './dtos/create-ruta.dto';
import { UpdateRutaDto } from './dtos/update-ruta.dto';

const { Prisma } = require(`${process.cwd()}/generated/prisma/client`) as {
  Prisma: typeof PrismaTypes;
};

function toJson(value: unknown): PrismaTypes.InputJsonValue {
  return value as PrismaTypes.InputJsonValue;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

type FindAllOptions = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  sort?: 'recent' | 'oldest' | 'name_asc' | 'name_desc';
};

@Injectable()
export class RutasService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereSql(
    search?: string,
    status: 'all' | 'active' | 'inactive' = 'all',
  ) {
    const conditions: PrismaTypes.Sql[] = [];

    if (status === 'active') {
      conditions.push(Prisma.sql`"estatus" = true`);
    } else if (status === 'inactive') {
      conditions.push(Prisma.sql`"estatus" = false`);
    }

    if (search) {
      const term = `%${search}%`;
      conditions.push(
        Prisma.sql`(
          "nombre" ILIKE ${term}
          OR COALESCE("descripcion", '') ILIKE ${term}
        )`,
      );
    }

    return conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;
  }

  private buildOrderSql(sort?: FindAllOptions['sort']) {
    if (sort === 'oldest') {
      return Prisma.sql`"createdAt" ASC, "id" ASC`;
    }

    if (sort === 'name_asc') {
      return Prisma.sql`LOWER("nombre") ASC, "nombre" ASC, "id" ASC`;
    }

    if (sort === 'name_desc') {
      return Prisma.sql`LOWER("nombre") DESC, "nombre" DESC, "id" DESC`;
    }

    return Prisma.sql`"createdAt" DESC, "id" DESC`;
  }

  private async findOrderedIds(
    whereSql: PrismaTypes.Sql,
    orderSql: PrismaTypes.Sql,
    page?: number,
    limit?: number,
  ) {
    const paginationSql =
      page && limit
        ? Prisma.sql`OFFSET ${(page - 1) * limit} LIMIT ${limit}`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT "id"
      FROM "operaciones"."Ruta"
      ${whereSql}
      ORDER BY ${orderSql}
      ${paginationSql}
    `);

    return rows.map((row) => row.id);
  }

  private async findManyByOrderedIds(ids: number[]) {
    if (ids.length === 0) return [];

    const rutas = await this.prisma.ruta.findMany({
      where: { id: { in: ids } },
    });
    const byId = new Map(rutas.map((ruta) => [ruta.id, ruta]));

    return ids
      .map((id) => byId.get(id))
      .filter((ruta): ruta is NonNullable<typeof ruta> => Boolean(ruta));
  }

  async create(dto: CreateRutaDto) {
    try {
      return await this.prisma.ruta.create({
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          origen: toJson(dto.origen),
          destino: toJson(dto.destino),
          paradas: toJson(dto.paradas ?? []),
          waypoints: dto.waypoints ? toJson(dto.waypoints) : undefined,
          encodedPolyline: dto.encodedPolyline,
          distanciaMetros: dto.distanciaMetros,
          duracionSegundos: dto.duracionSegundos,
          estatus: dto.estatus ?? true,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Ya existe una ruta con ese nombre');
      }
      throw error;
    }
  }

  async findAll(active: boolean, options: FindAllOptions = {}) {
    const search = options.search?.trim();
    const status = options.status ?? (active ? 'active' : 'all');
    const whereSql = this.buildWhereSql(search, status);
    const orderSql = this.buildOrderSql(options.sort);

    if (!options.page && !options.limit && !search) {
      const ids = await this.findOrderedIds(whereSql, orderSql);
      return this.findManyByOrderedIds(ids);
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 5));
    const [ids, totalRows] = await Promise.all([
      this.findOrderedIds(whereSql, orderSql, page, limit),
      this.prisma.$queryRaw<Array<{ total: bigint | number }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS "total"
        FROM "operaciones"."Ruta"
        ${whereSql}
      `),
    ]);
    const data = await this.findManyByOrderedIds(ids);
    const total = Number(totalRows[0]?.total || 0);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number) {
    const ruta = await this.prisma.ruta.findUnique({ where: { id } });

    if (!ruta) {
      throw new NotFoundException(`Ruta ${id} no existe`);
    }

    return ruta;
  }

  async update(id: number, dto: UpdateRutaDto) {
    await this.findOne(id);

    return this.prisma.ruta.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        origen: dto.origen ? toJson(dto.origen) : undefined,
        destino: dto.destino ? toJson(dto.destino) : undefined,
        paradas: dto.paradas ? toJson(dto.paradas) : undefined,
        waypoints: dto.waypoints ? toJson(dto.waypoints) : undefined,
        encodedPolyline: dto.encodedPolyline,
        distanciaMetros: dto.distanciaMetros,
        duracionSegundos: dto.duracionSegundos,
        estatus: dto.estatus,
      },
    });
  }

  async shutdown(id: number) {
    const ruta = await this.findOne(id);

    return this.prisma.ruta.update({
      where: { id },
      data: { estatus: !ruta.estatus },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.ruta.delete({ where: { id } });
  }
}
