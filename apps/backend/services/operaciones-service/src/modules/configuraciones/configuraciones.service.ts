import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateConfiguracionDto } from './dtos/update-configuracion.dto';

export const TOLERANCIA_CONEXION_KEY = 'rutas.toleranciaConexionMetros';
const DEFAULT_TOLERANCIA_CONEXION = 100;

@Injectable()
export class ConfiguracionesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.configuracionOperacion.findMany({
      orderBy: { clave: 'asc' },
    });
  }

  async findOne(clave: string) {
    const config = await this.prisma.configuracionOperacion.findUnique({
      where: { clave },
    });

    if (!config) {
      throw new NotFoundException(`Configuracion ${clave} no existe`);
    }

    return config;
  }

  async upsert(clave: string, dto: UpdateConfiguracionDto) {
    const valor = dto.valor as Prisma.InputJsonValue;

    return this.prisma.configuracionOperacion.upsert({
      where: { clave },
      update: {
        valor,
        descripcion: dto.descripcion,
      },
      create: {
        clave,
        valor,
        descripcion: dto.descripcion,
      },
    });
  }

  async getToleranciaConexionMetros() {
    const config = await this.prisma.configuracionOperacion.upsert({
      where: { clave: TOLERANCIA_CONEXION_KEY },
      update: {},
      create: {
        clave: TOLERANCIA_CONEXION_KEY,
        valor: DEFAULT_TOLERANCIA_CONEXION,
        descripcion:
          'Distancia maxima para considerar conectadas dos rutas consecutivas.',
      },
    });

    const value = Number(config.valor);
    return Number.isFinite(value) ? value : DEFAULT_TOLERANCIA_CONEXION;
  }
}
