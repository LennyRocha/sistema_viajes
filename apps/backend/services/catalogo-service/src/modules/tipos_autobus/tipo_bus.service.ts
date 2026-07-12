import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { TipoAutobus } from './tipo_bus.entity';

const LIST_CACHE_KEY = 'tipos_bus:list';

@Injectable()
export class TiposAutobusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll() {
    // 1) ¿está en caché?
    const cached = await this.redis.get<TipoAutobus[]>(LIST_CACHE_KEY);
    if (cached) return cached;

    // 2) no está → base de datos
    const tiposBuses = await this.prisma.tipoAutobus.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 3) guarda para la próxima (30 segundos)
    await this.redis.set(LIST_CACHE_KEY, tiposBuses, 86400); // 1 día
    return tiposBuses;
  }

  async findOne(id: number) {
    const parsed = Number(id);
    const tipoBus = await this.prisma.tipoAutobus.findUnique({
      where: { id: parsed },
    });
    if (!tipoBus)
      throw new NotFoundException(`Tipo de autobús ${id} no existe`);
    return tipoBus;
  }
}
