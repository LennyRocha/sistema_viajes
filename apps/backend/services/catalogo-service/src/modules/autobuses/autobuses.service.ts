/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
//Import de dtos cuando estén listos
import { Prisma } from '@prisma/client';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//import del entity cuando esté listo
import { InstitucionesService } from '../instituciones/instituciones.service';
import { ServiciosService } from '../servicios/servicios.service';
import { TiposAutobusService } from '../tipos_autobus/tipo_bus.service';

@Injectable()
export class AutobusesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly instituciones: InstitucionesService,
    private readonly servicios: ServiciosService,
    private readonly tipos: TiposAutobusService,
    @InjectPinoLogger(AutobusesService.name)
    private readonly logger: PinoLogger,
  ) {}
}
