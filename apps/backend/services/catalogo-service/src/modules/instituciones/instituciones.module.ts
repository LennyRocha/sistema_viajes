import { Module } from '@nestjs/common';
import { InstitucionesController } from './instituciones.controller';
import { InstitucionesService } from './instituciones.service';

@Module({
  providers: [InstitucionesService],
  controllers: [InstitucionesController],
  exports: [InstitucionesService],
})
export class InstitucionesModule {}
