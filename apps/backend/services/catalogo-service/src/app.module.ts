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
import { DisponibilidadServiciosModule } from './modules/disponibilidad-servicios/disponibilidad-servicios.module';
import { InstitucionesModule } from './modules/instituciones/instituciones.module';

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
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
