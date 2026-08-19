import { Module } from '@nestjs/common';

import { SalidasController } from './salidas.controller';
import { SalidasService } from './salidas.service';

import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
  ],
  controllers: [SalidasController],
  providers: [SalidasService],
  exports: [SalidasService],
})
export class SalidasModule {}