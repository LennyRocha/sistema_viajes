import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PRIVILEGES } from '../decorators/privileges.decorator';
import { AuthenticatedRequest } from '../auth.types';

@Injectable()
export class PrivilegesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PRIVILEGES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (user.privileges.includes('*') || user.roles.includes('ROLE_ADMIN') || required.every((privilege) => user.privileges.includes(privilege))) return true;
    throw new ForbiddenException('El usuario no tiene privilegios suficientes');
  }
}
