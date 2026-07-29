import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@commons/filters';
import { LoggerModule } from 'nestjs-pino';
import { HealthController } from './health/health.controller';
import { ConfiguracionesModule } from './modules/configuraciones/configuraciones.module';
import { RutasModule } from './modules/rutas/rutas.module';
import { ViajesBaseModule } from './modules/viajes-base/viajes-base.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(),
    PrismaModule,
    ConfiguracionesModule,
    RutasModule,
    ViajesBaseModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
