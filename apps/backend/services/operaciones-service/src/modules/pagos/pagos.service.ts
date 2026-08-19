import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { EstadoCompra } from './types/estado-compra';
import { EstadoPago } from './types/estado-pago';
import { CreatePagoDto } from './dtos/create-pago.dto';

@Injectable()
export class PagosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectPinoLogger(PagosService.name)
    private readonly logger: PinoLogger,
  ) {}

  async create(compraId: number, dto: CreatePagoDto) {
    this.logger.info(
      { compraId, metodoPagoId: dto.metodoPagoId },
      'Procesando pago',
    );

    const compra = await this.prisma.compra.findUnique({
      where: { id: compraId },
    });

    if (!compra) {
      throw new NotFoundException(`Compra ${compraId} no existe`);
    }

    if (compra.estado === EstadoCompra.CONFIRMADA) {
      throw new BadRequestException('La compra ya fue pagada');
    }

    if (compra.estado === EstadoCompra.CANCELADA) {
      throw new BadRequestException('La compra fue cancelada');
    }

    if (compra.expiraEn && compra.expiraEn < new Date()) {
      await this.prisma.compra.update({
        where: { id: compraId },
        data: { estado: EstadoCompra.CANCELADA },
      });
      throw new BadRequestException(
        'La reserva de asientos expiró, genera la compra nuevamente',
      );
    }

    const metodoPago = await this.prisma.metodoPago.findUnique({
      where: { id: dto.metodoPagoId },
    });

    if (!metodoPago || !metodoPago.estatus) {
      throw new BadRequestException(
        'El método de pago no existe o no está disponible',
      );
    }

    // ---- Simulación de pasarela: reemplazar por integración real ----
    const aprobado = true;
    const referencia = `SIM-${Date.now()}`;
    // -------------------------------------------------------------

    const [pago] = await this.prisma.$transaction([
      this.prisma.pago.create({
        data: {
          compraId,
          metodoPagoId: dto.metodoPagoId,
          monto: compra.monto,
          estado: aprobado ? EstadoPago.APROBADO : EstadoPago.RECHAZADO,
          referencia,
        },
      }),
      ...(aprobado
        ? [
            this.prisma.compra.update({
              where: { id: compraId },
              data: { estado: EstadoCompra.CONFIRMADA },
            }),
          ]
        : []),
    ]);

    try {
      await this.redis.del('salidas:list');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al limpiar caché');
    }

    this.logger.info({ pagoId: pago.id, aprobado }, 'Pago procesado');

    return pago;
  }

  async findByCompra(compraId: number) {
    return this.prisma.pago.findMany({
      where: { compraId },
      orderBy: { createdAt: 'desc' },
    });
  }
}