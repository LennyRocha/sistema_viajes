import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { SalidasService } from '../salidas/salidas.service';
import { EstadoCompra } from './types/estado-compra';
import { EstadoSalida } from './types/estado-salida';
import { CreateCompraDto } from './dto/create-compra.dto';

const RESERVA_MINUTOS = 15;

@Injectable()
export class ComprasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly salidasService: SalidasService,
    @InjectPinoLogger(ComprasService.name)
    private readonly logger: PinoLogger,
  ) { }

  private generarCodigo(): string {
    return `BC-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async create(dto: CreateCompraDto) {
    this.logger.info(
      { salidaId: dto.salidaId, compradorId: dto.compradorId },
      'Creando compra',
    );

    if (dto.asientos.length !== dto.pasajeros) {
      throw new BadRequestException(
        'La cantidad de asientos no coincide con la cantidad de pasajeros',
      );
    }

    const salida = await this.prisma.salida.findUnique({
      where: { id: dto.salidaId },
    });

    if (!salida) {
      throw new NotFoundException(`Salida ${dto.salidaId} no existe`);
    }

    if (salida.estadoSalida !== EstadoSalida.PROGRAMADO) {
      throw new BadRequestException(
        'La salida no admite compras en su estado actual',
      );
    }

    const comprador = await this.prisma.comprador.findUnique({
      where: { id: dto.compradorId },
    });

    if (!comprador) {
      throw new NotFoundException(`Comprador ${dto.compradorId} no existe`);
    }

    const layout = (salida.asientosLayout ?? []) as Array<{ id: string }>;
    const idsValidos = new Set(layout.map((a) => a.id));

    const asientosInvalidos = dto.asientos.filter((id) => !idsValidos.has(id));
    if (asientosInvalidos.length > 0) {
      throw new BadRequestException(
        `Los asientos ${asientosInvalidos.join(', ')} no existen en esta salida`,
      );
    }

    const ocupados = await this.salidasService.getAsientosOcupados(dto.salidaId);
    const yaOcupados = dto.asientos.filter((id) => ocupados.has(id));

    if (yaOcupados.length > 0) {
      throw new BadRequestException(
        `Los asientos ${yaOcupados.join(', ')} ya no están disponibles`,
      );
    }

    const precioUnitario = this.salidasService.getSalidaPrice(salida.precios);

    if (precioUnitario === null) {
      throw new BadRequestException(
        'No fue posible calcular el monto: la salida no tiene un precio configurado',
      );
    }

    const monto = precioUnitario * dto.pasajeros;

    const expiraEn = new Date(Date.now() + RESERVA_MINUTOS * 60 * 1000);

    const compra = await this.prisma.$transaction(async (tx) => {
      return tx.compra.create({
        data: {
          salidaId: dto.salidaId,
          compradorId: dto.compradorId,
          pasajeros: dto.pasajeros,
          asientos: dto.asientos,
          monto,
          codigo: this.generarCodigo(),
          estado: EstadoCompra.PENDIENTE,
          expiraEn,
        },
      });
    });

    try {
      await this.redis.del('salidas:list');
    } catch (error) {
      this.logger.error({ err: error }, 'Error al limpiar caché');
    }

    this.logger.info({ compraId: compra.id }, 'Compra creada correctamente');

    return compra;
  }

  async findAll() {
    return this.prisma.compra.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const compra = await this.prisma.compra.findUnique({ where: { id } });

    if (!compra) {
      throw new NotFoundException(`Compra ${id} no existe`);
    }

    return compra;
  }

  async cancel(id: number) {
    const compra = await this.prisma.compra.findUnique({ where: { id } });

    if (!compra) {
      throw new NotFoundException(`Compra ${id} no existe`);
    }

    if (compra.estado === EstadoCompra.CONFIRMADA) {
      throw new BadRequestException(
        'No se puede cancelar una compra ya confirmada',
      );
    }

    return this.prisma.compra.update({
      where: { id },
      data: { estado: EstadoCompra.CANCELADA },
    });
  }
}