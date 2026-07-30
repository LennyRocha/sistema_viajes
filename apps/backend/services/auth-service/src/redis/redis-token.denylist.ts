/**
 * Denylist de access tokens en Redis con TTL = vida restante del JWT.
 * Por qué Redis: consulta O(1) en cada request autenticado; la fila en Postgres
 * es respaldo/auditoría, pero el hot path no debe ir a SQL.
 */
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { TokenDenylistPort } from 'src/ports/tokens.ports';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RedisTokenDenylist implements TokenDenylistPort, OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly prisma: PrismaService) {
    this.redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    this.redis.on('error', () => undefined);
  }

  async revoke(jti: string, expiresAt: Date): Promise<void> {
    const ttlMs = expiresAt.getTime() - Date.now();
    const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
    await this.prisma.revokedAccessToken.upsert({
      where: { jti },
      create: { jti, expiresAt },
      update: { expiresAt },
    });
    try {
      await this.redis.set(`revoked:access:${jti}`, '1', 'EX', ttlSec);
    } catch {
      // PostgreSQL conserva la revocación durante una caída temporal de Redis.
    }
  }

  async isRevoked(jti: string): Promise<boolean> {
    try {
      const hit = await this.redis.get(`revoked:access:${jti}`);
      if (hit === '1') return true;
    } catch {
      // El fallback evita aceptar tokens revocados si Redis está indisponible.
    }
    return Boolean(
      await this.prisma.revokedAccessToken.findFirst({
        where: { jti, expiresAt: { gt: new Date() } },
      }),
    );
  }

  async onModuleDestroy() {
    this.redis.disconnect();
  }
}
