import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { EstadoCompra } from './types/estado-compra';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ComprasExpiracionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectPinoLogger(ComprasExpiracionService.name)
    private readonly logger: PinoLogger,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cancelarComprasVencidas() {
    const vencidas = await this.prisma.compra.findMany({
      where: {
        estado: EstadoCompra.PENDIENTE,
        expiraEn: { lt: new Date() },
      },
      select: { id: true, salidaId: true },
    });

    if (vencidas.length === 0) {
      return;
    }

    const ids = vencidas.map((c) => c.id);

    await this.prisma.compra.updateMany({
      where: { id: { in: ids } },
      data: { estado: EstadoCompra.CANCELADA },
    });

    this.logger.info(
      { cantidad: ids.length, compraIds: ids },
      'Compras pendientes canceladas por expiración',
    );

    try {
      await this.redis.del('salidas:list');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al limpiar caché');
    }
  }
}