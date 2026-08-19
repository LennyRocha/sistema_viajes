import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { ArgonPasswordHasher } from 'src/infra/crypto/argon-password.hasher';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JoseTokenSigner } from '../../infra/jwt/jose-token.signer';
import { RedisTokenDenylist } from '../../redis/redis-token.denylist';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrivilegesGuard } from '../auth/guards/privileges.guard';

@Module({
  providers: [
    UsuariosService,
    ArgonPasswordHasher,
    JoseTokenSigner,
    RedisTokenDenylist,
    JwtAuthGuard,
    PrivilegesGuard,
  ],
  controllers: [UsuariosController],
  exports: [UsuariosService],
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
export class UsuariosModule {}
