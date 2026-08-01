import { Injectable } from '@nestjs/common';
import { DashboardGateway } from 'src/dashboard.gateway';

@Injectable()
export class SocketEventsService {
  constructor(private readonly gateway: DashboardGateway) {}

  notificaciones(data: { usuario: number; notificaciones: any }) {
    this.gateway.server.emit('notificaciones', data);
  }

  calendario(data: any[]) {
    this.gateway.server.emit('calendario', data);
  }

  nuevoAutobus(data: any[]) {
    this.gateway.server.emit('nuevo:autobus', data);
  }

  changedAutobus(data: any[]) {
    this.gateway.server.emit('changed:autobus', data);
  }

  estadoAutobus(data: any) {
    this.gateway.server.emit('estado:autobus', data);
  }

  nuevaInstitucion(data: any[]) {
    this.gateway.server.emit('nuevo:institucion', data);
  }

  asientosAutobus(data: { autobus: number; asientos: any[] }) {
    this.gateway.server.emit('asientos:autobus', data);
  }

  viajesActualizados(data: any[]) {
    this.gateway.server.emit('viajes:actualizados', data);
  }

  calendarioConductor(data: { usuario: number; salidas: any[] }) {
    this.gateway.server.emit('calendario:conductor', data);
  }

  dashboard(data: { usuario: number; dashboard: any }) {
    this.gateway.server.emit('dashboard', data);
  }
}
