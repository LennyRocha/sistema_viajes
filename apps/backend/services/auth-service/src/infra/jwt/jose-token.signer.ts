/**
 * Firma RS256 con llave privada local; publica JWKS con la pública.
 * Por qué asimétrico: gateway/tasks verifican con la pública y NUNCA pueden firmar.
 * Con HS256 el secreto compartido permitiría a cualquier servicio emitir tokens.
 * Por qué iss/aud: sin ellos, un token firmado por esta llave para otro sistema
 * (u otro entorno) también pasaría la verificación de firma en este API.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  calculateJwkThumbprint,
  exportJWK,
  importPKCS8,
  importSPKI,
  jwtVerify,
  SignJWT,
  type KeyLike,
} from 'jose';
import { AccessTokenClaims, TokenSignerPort } from '../../ports/tokens.ports';

@Injectable()
export class JoseTokenSigner implements TokenSignerPort, OnModuleInit {
  private privateKey!: KeyLike;
  private publicKey!: KeyLike;
  private kid!: string;
  private publicJwk!: Record<string, unknown>;
  private accessTtlSec = Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900);
  private issuer = process.env.JWT_ISSUER ?? 'nest-auth-demo';
  private audience = process.env.JWT_AUDIENCE ?? 'nest-demo-api';

  async onModuleInit() {
    const privatePath = resolve(process.env.JWT_PRIVATE_KEY_PATH ?? '../../keys/jwt_private.pem');
    const publicPath = resolve(process.env.JWT_PUBLIC_KEY_PATH ?? '../../keys/jwt_public.pem');
    const privatePem = readFileSync(privatePath, 'utf8');
    const publicPem = readFileSync(publicPath, 'utf8');
    this.privateKey = await importPKCS8(privatePem, 'RS256');
    this.publicKey = await importSPKI(publicPem, 'RS256');
    const jwk = await exportJWK(this.publicKey);
    // kid = thumbprint RFC 7638 del JWK: estable ante cambios de formato del PEM
    // (un hash del archivo cambiaría con un salto de línea; el thumbprint no).
    this.kid = await calculateJwkThumbprint(jwk);
    this.publicJwk = {
      ...jwk,
      kid: this.kid,
      use: 'sig',
      alg: 'RS256',
    };
  }

  getKid(): string {
    return this.kid;
  }

  getJwks() {
    return { keys: [this.publicJwk] };
  }

  async signAccess(
    claims: Omit<AccessTokenClaims, 'jti'> & { jti?: string },
  ): Promise<{ accessToken: string; jti: string; expiresAt: Date }> {
    const jti = claims.jti ?? randomUUID();
    const expiresAt = new Date(Date.now() + this.accessTtlSec * 1000);
    const accessToken = await new SignJWT({
      tid: claims.tid,
      email: claims.email,
      roles: claims.roles,
      privileges: claims.privileges,
    })
      .setProtectedHeader({ alg: 'RS256', kid: this.kid })
      .setSubject(claims.sub)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(`${this.accessTtlSec}s`)
      .setJti(jti)
      .sign(this.privateKey);
    return { accessToken, jti, expiresAt };
  }

  async verifyAccess(token: string): Promise<AccessTokenClaims & { exp: number }> {
    const { payload } = await jwtVerify(token, this.publicKey, {
      algorithms: ['RS256'],
      issuer: this.issuer,
      audience: this.audience,
    });
    if (
      !payload.sub ||
      !payload.jti ||
      !payload.exp ||
      typeof payload.tid !== 'string' ||
      typeof payload.email !== 'string' ||
      !Array.isArray(payload.roles) ||
      !Array.isArray(payload.privileges)
    ) {
      throw new Error('JWT sin claims de acceso requeridos');
    }
    return {
      sub: payload.sub,
      tid: payload.tid,
      email: payload.email,
      roles: payload.roles as string[],
      privileges: payload.privileges as string[],
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
