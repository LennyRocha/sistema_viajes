import { Module } from '@nestjs/common';
import { ConductoresController } from './conductores.controller';
import { ConductoresService } from './conductores.service';
import { InstitucionesModule } from '../instituciones/instituciones.module';

@Module({
  imports: [InstitucionesModule],
  controllers: [ConductoresController],
  providers: [ConductoresService],
  exports: [ConductoresService], // necesario para que LicenciasModule lo use
})
export class ConductoresModule {}