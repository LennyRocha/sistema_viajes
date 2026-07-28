import { Module } from '@nestjs/common';
import { LicenciasController } from './licencias.controller';
import { LicenciasService } from './licencias.service';
import { ConductoresModule } from '../conductores/conductores.module';

@Module({
  imports: [ConductoresModule],
  controllers: [LicenciasController],
  providers: [LicenciasService],
})
export class LicenciasModule {}