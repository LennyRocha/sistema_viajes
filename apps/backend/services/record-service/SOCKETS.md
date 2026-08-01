# Integración de RabbitMQ + WebSockets

Este documento describe cómo enviar eventos desde cualquier microservicio hacia el `record-service`, el cual es el encargado de distribuirlos mediante WebSockets.

---

## 1. Registrar el cliente de RabbitMQ en un módulo

En el módulo desde el cual se enviarán eventos (por ejemplo `AutobusesModule`), importar el `ClientsModule` y registrar el cliente.

```ts
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RECORD_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'record_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
})
export class AutobusesModule {}
```

> **Nota:** El `ClientsModule` debe estar disponible en el módulo donde se utilizará el `ClientProxy`.

---

## 2. Inyectar el cliente en un Service

```ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AutobusesService {
  constructor(
    @Inject('RECORD_SERVICE')
    private readonly recordClient: ClientProxy,
  ) {}

  async actualizarEstado() {
    // Lógica...

    this.recordClient.emit('bus.status.changed', {
      busId: 15,
      status: 'EN_VIAJE',
    });
  }
}
```

---

## 3. Agregar un nuevo canal WebSocket

### 3.1 Crear el método en `SocketEventsService`

```ts
@Injectable()
export class SocketEventsService {
  constructor(private readonly gateway: DashboardGateway) {}

  busStatusChanged(data: BusStatusDto) {
    this.gateway.server.emit('bus.status.changed', data);
  }
}
```

Todos los `server.emit()` deben concentrarse en este servicio.

---

### 3.2 Escuchar el evento de RabbitMQ

```ts
@Controller()
export class BusConsumer {
  constructor(private readonly socketEvents: SocketEventsService) {}

  @EventPattern('bus.status.changed')
  handle(data: BusStatusDto) {
    this.socketEvents.busStatusChanged(data);
  }
}
```

---

### 3.3 Publicar el evento desde otro microservicio

```ts
this.recordClient.emit('bus.status.changed', {
  busId,
  status: 'EN_VIAJE',
});
```

---

## Flujo completo

```text
Microservicio
      │
      │ ClientProxy.emit(...)
      ▼
 RabbitMQ
      │
      ▼
@EventPattern(...)
      │
      ▼
SocketEventsService
      │
      ▼
DashboardGateway
      │
      ▼
Frontend (Socket.IO)
```

---

## Convenciones

- Utilizar nombres de eventos descriptivos.
- Preferir eventos de dominio en lugar de eventos de CRUD.

Ejemplos:

```text
dashboard.refresh

bus.status.changed

trip.created
trip.updated

seat.updated

notification.created
```

---

## Recomendaciones

- No utilizar `server.emit()` directamente fuera de `SocketEventsService`.
- No importar `DashboardGateway` desde otros microservicios.
- La comunicación entre microservicios debe realizarse únicamente mediante RabbitMQ.
- Mantener el `record-service` como el único responsable de emitir eventos WebSocket a los clientes.
