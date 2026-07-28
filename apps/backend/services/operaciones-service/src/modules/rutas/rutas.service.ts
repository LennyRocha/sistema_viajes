import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRutaDto } from './dtos/create-ruta.dto';
import { UpdateRutaDto } from './dtos/update-ruta.dto';

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

@Injectable()
export class RutasService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRutaDto) {
    return this.prisma.ruta.create({
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
  }

  findAll(active: boolean) {
    return this.prisma.ruta.findMany({
      where: active ? { estatus: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
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
