import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const expected = this.config.get<string>('INTERNAL_SERVICE_TOKEN');
    const received = context.switchToHttp().getRequest().headers[
      'x-internal-service-token'
    ];

    if (!expected || received !== expected) {
      throw new ForbiddenException('Servicio interno no autorizado');
    }

    return true;
  }
}
