import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { ArgonPasswordHasher } from 'src/infra/crypto/argon-password.hasher';

@Module({
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],
  imports: [ArgonPasswordHasher],
})
export class UsuariosModule {}
