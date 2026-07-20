import { Module } from '@nestjs/common';
import { DisponibilidadServiciosService } from './disponibilidad-servicios.service';
import { DisponibilidadServiciosController } from './disponibilidad-servicios.controller';
import { InstitucionesModule } from '../instituciones/instituciones.module';
import { TiposAutobusModule } from '../tipos_autobus/tipo_bus.module';
import { ServiciosModule } from '../servicios/servicios.module';

@Module({
  imports: [ServiciosModule, TiposAutobusModule, InstitucionesModule],
  providers: [DisponibilidadServiciosService],
  controllers: [DisponibilidadServiciosController],
  exports: [DisponibilidadServiciosService],
})
export class DisponibilidadServiciosModule {}
