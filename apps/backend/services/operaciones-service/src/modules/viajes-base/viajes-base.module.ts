import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfiguracionesModule } from '../configuraciones/configuraciones.module';
import { ViajesBaseController } from './viajes-base.controller';
import { ViajesBaseService } from './viajes-base.service';

@Module({
  imports: [PrismaModule, ConfiguracionesModule],
  controllers: [ViajesBaseController],
  providers: [ViajesBaseService],
})
export class ViajesBaseModule {}
