import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCompradorDto } from './dtos/create-comprador.dto';

@Injectable()
export class CompradoresService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(CompradoresService.name)
    private readonly logger: PinoLogger,
  ) {}

  async findOrCreate(dto: CreateCompradorDto) {
    this.logger.info(
      { email: dto.email, telefono: dto.telefono },
      'Buscando o creando comprador',
    );

    const existente = await this.prisma.comprador.findFirst({
      where: {
        OR: [{ email: dto.email }, { telefono: dto.telefono }],
      },
    });

    if (existente) {
      this.logger.debug(
        { compradorId: existente.id },
        'Comprador ya existía, se reutiliza',
      );
      return existente;
    }

    try {
      const comprador = await this.prisma.comprador.create({ data: dto });
      this.logger.info(
        { compradorId: comprador.id },
        'Comprador creado correctamente',
      );
      return comprador;
    } catch (error) {
      this.logger.error({ err: error }, 'Error al crear comprador');
      throw new BadRequestException(
        'No fue posible registrar el comprador, verifica los datos',
      );
    }
  }

  async findOne(id: number) {
    const comprador = await this.prisma.comprador.findUnique({
      where: { id },
    });

    if (!comprador) {
      throw new NotFoundException(`Comprador ${id} no existe`);
    }

    return comprador;
  }
}