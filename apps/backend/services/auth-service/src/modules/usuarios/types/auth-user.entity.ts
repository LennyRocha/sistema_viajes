/**
 * Entidades de dominio (formas puras, sin decoradores Nest/Prisma).
 * Por qué: los use-cases razonan sobre estas formas; los adapters mapean desde/hacia DB/HTTP.
 */
export interface AccessTokenClaims {
  sub: string;
  tid: string;
  email: string;
  roles: string[];
  privileges: string[];
  jti: string;
}

export interface AuthUserView {
  id: string;
  email: string;
  companyId: string;
  status: string;
  roles: string[];
  privileges: string[];
  person?: { firstName: string; lastName: string };
}
