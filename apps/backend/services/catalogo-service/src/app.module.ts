/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { TiposAutobusModule } from './modules/tipos_autobus/tipo_bus.module';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { PrismaExceptionFilter } from 'prisma/primsa-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AutobusesModule } from './modules/autobuses/autobuses.module';
import { ConductoresModule } from './modules/conductores/conductores.module';
import { DisponibilidadServiciosModule } from './modules/disponibilidad-servicios/disponibilidad-servicios.module';
import { InstitucionesModule } from './modules/instituciones/instituciones.module';
import { HttpExceptionFilter } from '@commons/filters';
import { LicenciasModule } from './modules/licencias/licencias.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(),
    PrismaModule,
    RedisModule,
    TiposAutobusModule,
    ServiciosModule,
    AutobusesModule,
    InstitucionesModule,
    DisponibilidadServiciosModule,
    ConductoresModule,
    LicenciasModule,
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
