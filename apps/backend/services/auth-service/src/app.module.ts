/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { PrismaExceptionFilter } from 'prisma/primsa-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { HttpExceptionFilter } from '@commons/filters';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { RolesModule } from './modules/roles/roles.module';
import { PrivilegiosModule } from './modules/privilegios/privilegios.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(),
    PrismaModule,
    RedisModule,
    UsuariosModule,
    RolesModule,
    PrivilegiosModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
