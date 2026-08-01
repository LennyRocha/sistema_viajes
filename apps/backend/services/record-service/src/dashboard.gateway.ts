/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for demo; restrict in production
  },
})
export class DashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  // Called when a client connects
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('welcome', { message: 'Welcome to the WebSocket server!' });
  }

  // Called when a client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  async joinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(room);
  }

  @SubscribeMessage('leave')
  async leaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(room);
  }
}
