import { Module } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JoseTokenSigner } from '../../infra/jwt/jose-token.signer';
import { RedisTokenDenylist } from '../../redis/redis-token.denylist';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrivilegesGuard } from './guards/privileges.guard';
import { ReportActivityPublisher } from './report-activity.publisher';

@Module({
  imports: [UsuariosModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JoseTokenSigner,
    RedisTokenDenylist,
    JwtAuthGuard,
    RolesGuard,
    PrivilegesGuard,
    ReportActivityPublisher,
  ],
  exports: [JoseTokenSigner, RedisTokenDenylist, JwtAuthGuard, RolesGuard, PrivilegesGuard],
})
export class AuthModule {}
