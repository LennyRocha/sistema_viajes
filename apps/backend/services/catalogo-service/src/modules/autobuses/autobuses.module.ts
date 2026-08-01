import { Module } from '@nestjs/common';
import { AutobusesService } from './autobuses.service';
import { AutobusesController } from './autobuses.controller';
import { ServiciosModule } from '../servicios/servicios.module';
import { TiposAutobusModule } from '../tipos_autobus/tipo_bus.module';
import { InstitucionesModule } from '../instituciones/instituciones.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ServiciosModule,
    TiposAutobusModule,
    InstitucionesModule,
    ClientsModule.register([
      {
        name: 'RECORD_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5672'],
          queue: 'record_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [AutobusesService],
  controllers: [AutobusesController],
})
export class AutobusesModule {}
