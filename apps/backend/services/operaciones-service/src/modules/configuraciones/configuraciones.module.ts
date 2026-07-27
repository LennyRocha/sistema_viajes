import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfiguracionesController } from './configuraciones.controller';
import { ConfiguracionesService } from './configuraciones.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConfiguracionesController],
  providers: [ConfiguracionesService],
  exports: [ConfiguracionesService],
})
export class ConfiguracionesModule {}
