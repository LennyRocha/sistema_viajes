/**
 * Puertos (interfaces): el dominio/aplicación depende de contratos, no de Prisma/jose/Redis.
 * Así puedes testear use-cases con fakes y cambiar infra sin tocar reglas de negocio.
 */
import { AccessTokenClaims, AuthUserView } from '../domain/entities/auth-user.entity';

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
export const TOKEN_SIGNER = Symbol('TOKEN_SIGNER');
export const TOKEN_DENYLIST = Symbol('TOKEN_DENYLIST');

export interface PasswordHasherPort {
  hash(plain: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}

export interface TokenSignerPort {
  signAccess(claims: Omit<AccessTokenClaims, 'jti'> & { jti?: string }): Promise<{
    accessToken: string;
    jti: string;
    expiresAt: Date;
  }>;
  verifyAccess(token: string): Promise<AccessTokenClaims & { exp: number }>;
  getJwks(): { keys: Record<string, unknown>[] };
  getKid(): string;
}

export interface TokenDenylistPort {
  revoke(jti: string, expiresAt: Date): Promise<void>;
  isRevoked(jti: string): Promise<boolean>;
}

export type { AuthUserView, AccessTokenClaims };
