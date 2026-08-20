import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JoseTokenSigner } from '../../../infra/jwt/jose-token.signer';
import { RedisTokenDenylist } from '../../../redis/redis-token.denylist';
import { AuthenticatedRequest } from '../auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly signer: JoseTokenSigner,
    private readonly denylist: RedisTokenDenylist,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const internalToken = this.config.get<string>('INTERNAL_SERVICE_TOKEN');
    const receivedInternalToken = request.headers['x-internal-service-token'];
    if (internalToken && receivedInternalToken === internalToken) {
      request.user = {
        sub: 'internal-service',
        tid: 'nexoroute',
        email: 'internal@nexoroute.local',
        roles: ['ROLE_ADMIN'],
        privileges: ['*'],
        jti: 'internal-service',
      };
      return true;
    }

    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    if (!token) throw new UnauthorizedException('Bearer token requerido');

    try {
      const claims = await this.signer.verifyAccess(token);
      if (await this.denylist.isRevoked(claims.jti)) {
        throw new UnauthorizedException('Access token revocado');
      }
      request.user = claims;
      request.accessToken = token;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Access token invalido');
    }
  }
}
