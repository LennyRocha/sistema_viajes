import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SocketEventsService } from '../modules/socketEvents/socket.event.service';

@Controller()
export class BusConsumer {
  constructor(private readonly socketEvents: SocketEventsService) {}

  @EventPattern('bus.nuevo')
  handleNuevoAutobus(@Payload() data: any[]) {
    this.socketEvents.nuevoAutobus(data);
  }

  @EventPattern('bus.updated')
  handleChangeAutobus(@Payload() data: any[]) {
    this.socketEvents.changedAutobus(data);
  }

  @EventPattern('bus.estado')
  handleEstadoAutobus(@Payload() data: any) {
    this.socketEvents.estadoAutobus(data);
  }

  @EventPattern('bus.asientos')
  handleAsientosAutobus(@Payload() data: { autobus: number; asientos: any[] }) {
    this.socketEvents.asientosAutobus(data);
  }
}
