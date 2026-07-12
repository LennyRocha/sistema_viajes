import { Module } from '@nestjs/common';
import { TiposAutobusModule } from './modules/tipos_autobus/tipo_bus.module';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { ServiciosModule } from './modules/servicios/servicios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    TiposAutobusModule,
    ServiciosModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
