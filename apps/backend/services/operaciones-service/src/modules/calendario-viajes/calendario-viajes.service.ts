import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { buildCalendarioMes } from './calendario-viajes.utils';
import { CalendarioMesQueryDto } from './dtos/calendario-mes-query.dto';

@Injectable()
export class CalendarioViajesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonth(query: CalendarioMesQueryDto) {
    const where: Prisma.SalidaWhereInput = {
      ...(query.viajeBaseId ? { viajeBaseId: query.viajeBaseId } : {}),
      ...(query.conductorId ? { conductorId: query.conductorId } : {}),
      ...(query.autobusId ? { autobusId: query.autobusId } : {}),
      ...(query.estadoSalida ? { estadoSalida: query.estadoSalida } : {}),
    };

    const salidas = await this.prisma.salida.findMany({
      where,
      include: {
        viaje: {
          include: {
            rutas: {
              include: {
                ruta: true,
              },
            },
          },
        },
      },
    });

    const salidaIds = salidas.map((salida) => salida.id);
    const compras = salidaIds.length
      ? await this.prisma.compra.findMany({
          where: { salidaId: { in: salidaIds } },
          select: {
            salidaId: true,
            estado: true,
            expiraEn: true,
            asientos: true,
          },
        })
      : [];
    const comprasBySalida = new Map<number, typeof compras>();

    compras.forEach((compra) => {
      const current = comprasBySalida.get(compra.salidaId) ?? [];
      current.push(compra);
      comprasBySalida.set(compra.salidaId, current);
    });

    return buildCalendarioMes(
      query.year,
      query.month,
      salidas.map((salida) => ({
        ...salida,
        boletos: comprasBySalida.get(salida.id) ?? [],
      })),
    );
  }
}
