import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateServicioDto } from './dtos/create-servicio.dto';
import { UpdateServicioDto } from './dtos/update-servicio.dto';
import { Prisma } from '@prisma/client';

const LIST_CACHE_KEY = 'servicios:list';

@Injectable()
export class ServiciosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateServicioDto) {
    const servicio = await this.prisma.servicio.create({
      data: {
        ...dto,
        propiedades: dto.propiedades as unknown as Prisma.InputJsonValue,
      },
    });
    await this.redis.del(LIST_CACHE_KEY);
    return servicio;
  }

  async findAll() {
    // 1) ¿está en caché?
    const cached = await this.redis.get<unknown[]>(LIST_CACHE_KEY);
    if (cached) return cached;

    // 2) no está → base de datos
    const servicios = await this.prisma.servicio.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 3) guarda para la próxima (30 segundos)
    await this.redis.set(LIST_CACHE_KEY, servicios, 30);
    return servicios;
  }

  async findOne(id: number) {
    const parsed = Number(id);
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: parsed },
    });
    if (!servicio) throw new NotFoundException(`Servicio ${id} no existe`);
    return servicio;
  }

  async findOneName(nombre: string) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { nombre },
    });
    if (!servicio) throw new NotFoundException(`Servicio ${nombre} no existe`);
    return servicio;
  }

  async update(id: number, dto: UpdateServicioDto) {
    const parsed = Number(id);
    await this.findOne(parsed); // 404 si no existe
    const servicio = await this.prisma.servicio.update({
      where: { id: parsed },
      data: {
        ...dto,
        propiedades: dto.propiedades as unknown as Prisma.InputJsonValue,
      },
    });
    await this.redis.del(LIST_CACHE_KEY);
    return servicio;
  }

  async shutdown(id: number) {
    const parsed = Number(id);
    const existing = await this.findOne(parsed);
    await this.prisma.servicio.update({
      where: { id: parsed },
      data: { estatus: !existing.estatus },
    });
    await this.redis.del(LIST_CACHE_KEY);
    return { deleted: true };
  }

  async remove(id: number) {
    const parsed = Number(id);
    await this.findOne(parsed);
    await this.prisma.servicio.delete({ where: { id: parsed } });
    await this.redis.del(LIST_CACHE_KEY);
    return { deleted: true };
  }
}
