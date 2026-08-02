import { Module } from '@nestjs/common';
import { InstitucionesController } from './instituciones.controller';
import { InstitucionesService } from './instituciones.service';
import { Transport } from '@nestjs/microservices/enums/transport.enum';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';

@Module({
  providers: [InstitucionesService],
  controllers: [InstitucionesController],
  exports: [InstitucionesService],
  imports: [
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
})
export class InstitucionesModule {}
