import { Module } from '@nestjs/common';
import { AutobusesService } from './autobuses.service';
import { AutobusesController } from './autobuses.controller';
import { ServiciosModule } from '../servicios/servicios.module';
import { TiposAutobusModule } from '../tipos_autobus/tipo_bus.module';
import { InstitucionesModule } from '../instituciones/instituciones.module';

@Module({
  imports: [ServiciosModule, TiposAutobusModule, InstitucionesModule],
  providers: [AutobusesService],
  controllers: [AutobusesController],
})
export class AutobusesModule {}
