import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JoseTokenSigner } from '../../infra/jwt/jose-token.signer';
import { RedisTokenDenylist } from '../../redis/redis-token.denylist';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AccessTokenClaims } from '../usuarios/types/auth-user.entity';
import {
  ReportActivityPublisher,
  type ReportRequestContext,
} from './report-activity.publisher';

const hashRefreshToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  private readonly refreshTtlSeconds = Number(
    process.env.JWT_REFRESH_TTL_SECONDS ?? 604800,
  );

  constructor(
    private readonly users: UsuariosService,
    private readonly prisma: PrismaService,
    private readonly signer: JoseTokenSigner,
    private readonly denylist: RedisTokenDenylist,
    private readonly activity: ReportActivityPublisher,
  ) {}

  async register(dto: RegisterDto, context: ReportRequestContext = {}) {
    try {
      const user = await this.users.create(dto, 'ROLE_CLIENTE');
      const session = await this.issueTokens(user.id);
      this.activity.record({
        ...context,
        evento: 'REGISTRO_CLIENTE',
        categoria: 'AUTENTICACION',
        accion: 'Registrar cuenta de cliente',
        modulo: 'Auth',
        resultado: 'EXITO',
        severidad: 'INFO',
        usuarioId: session.user.id,
        email: session.user.email,
        roles: session.user.roles,
      });
      return session;
    } catch (error) {
      this.activity.record({
        ...context,
        evento: 'REGISTRO_CLIENTE',
        categoria: 'AUTENTICACION',
        accion: 'Registrar cuenta de cliente',
        modulo: 'Auth',
        resultado: 'FALLO',
        severidad: 'ADVERTENCIA',
        email: dto.email,
        mensaje: this.errorMessage(error),
      });
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('El correo, CURP o telefono ya esta registrado');
      }
      throw error;
    }
  }

  async login(dto: LoginDto, context: ReportRequestContext = {}) {
    try {
      const user = await this.users.login(dto.email, dto.password);
      const session = await this.issueTokens(user.id);
      this.activity.record({
        ...context,
        evento: 'INICIO_SESION',
        categoria: 'AUTENTICACION',
        accion: 'Iniciar sesion',
        modulo: 'Auth',
        resultado: 'EXITO',
        severidad: 'INFO',
        usuarioId: session.user.id,
        email: session.user.email,
        roles: session.user.roles,
      });
      return session;
    } catch (error) {
      this.activity.record({
        ...context,
        evento: 'INICIO_SESION',
        categoria: 'AUTENTICACION',
        accion: 'Iniciar sesion',
        modulo: 'Auth',
        resultado: 'FALLO',
        severidad: 'ADVERTENCIA',
        email: dto.email,
        mensaje: 'Credenciales rechazadas',
      });
      throw error;
    }
  }

  async refresh(rawRefreshToken: string, context: ReportRequestContext = {}) {
    let usuarioId: number | undefined;
    try {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      const stored = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });
      if (!stored) throw new UnauthorizedException('Refresh token invalido');
      usuarioId = stored.userId;

      const expired = stored.expiresAt.getTime() <= Date.now();
      if (stored.usedAt || stored.revokedAt || expired) {
        if (stored.usedAt || stored.revokedAt) await this.revokeFamily(stored.familyId);
        throw new UnauthorizedException('Refresh token expirado o revocado');
      }

      const updated = await this.prisma.refreshToken.updateMany({
        where: { id: stored.id, usedAt: null, revokedAt: null },
        data: { usedAt: new Date() },
      });
      if (updated.count !== 1) {
        await this.revokeFamily(stored.familyId);
        throw new UnauthorizedException('Refresh token reutilizado');
      }
      return this.issueTokens(stored.userId, stored.familyId);
    } catch (error) {
      this.activity.record({
        ...context,
        evento: 'REFRESH_RECHAZADO',
        categoria: 'SEGURIDAD',
        accion: 'Renovar sesion',
        modulo: 'Auth',
        resultado: 'DENEGADO',
        severidad: 'ADVERTENCIA',
        usuarioId,
        mensaje: this.errorMessage(error),
      });
      throw error;
    }
  }

  async logout(
    refreshToken?: string,
    accessToken?: string,
    context: ReportRequestContext = {},
  ) {
    let usuarioId: number | undefined;
    let email: string | undefined;
    let roles: string[] | undefined;
    if (refreshToken) {
      const stored = await this.prisma.refreshToken.findUnique({
        where: { tokenHash: hashRefreshToken(refreshToken) },
      });
      if (stored) {
        usuarioId = stored.userId;
        await this.revokeFamily(stored.familyId);
      }
    }

    if (accessToken) {
      try {
        const claims = await this.signer.verifyAccess(accessToken);
        usuarioId = Number(claims.sub);
        email = claims.email;
        roles = claims.roles;
        await this.denylist.revoke(claims.jti, new Date(claims.exp * 1000));
      } catch {
        // Logout es idempotente: un access token ya expirado no debe bloquearlo.
      }
    }
    this.activity.record({
      ...context,
      evento: 'CIERRE_SESION',
      categoria: 'AUTENTICACION',
      accion: 'Cerrar sesion',
      modulo: 'Auth',
      resultado: 'EXITO',
      severidad: 'INFO',
      usuarioId,
      email,
      roles,
    });
    return { loggedOut: true };
  }

  async me(claims: AccessTokenClaims) {
    return this.users.getAuthView(Number(claims.sub));
  }

  jwks() {
    return this.signer.getJwks();
  }

  private async issueTokens(userId: number, familyId: string = randomUUID()) {
    const user = await this.users.getAuthView(userId);
    const signed = await this.signer.signAccess({
      sub: String(user.id),
      tid: 'nexoroute',
      email: user.email,
      roles: user.roles,
      privileges: user.privileges,
    });
    const refreshToken = randomBytes(64).toString('base64url');
    const expiresAt = new Date(Date.now() + this.refreshTtlSeconds * 1000);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        familyId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt,
      },
    });
    return {
      accessToken: signed.accessToken,
      refreshToken,
      accessTokenExpiresAt: signed.expiresAt,
      refreshTokenExpiresAt: expiresAt,
      tokenType: 'Bearer',
      user,
    };
  }

  private revokeFamily(familyId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message.slice(0, 500) : 'Error no identificado';
  }
}
