import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { ArgonPasswordHasher } from 'src/infra/crypto/argon-password.hasher';

@Module({
  providers: [UsuariosService, ArgonPasswordHasher],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}
