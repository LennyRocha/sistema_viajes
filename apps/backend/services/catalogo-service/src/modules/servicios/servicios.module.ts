import { Module } from '@nestjs/common';
import { ServiciosController } from './servicio.controller';
import { ServiciosService } from './servicios.service';

@Module({
  controllers: [ServiciosController],
  providers: [ServiciosService],
})
export class ServiciosModule {}
