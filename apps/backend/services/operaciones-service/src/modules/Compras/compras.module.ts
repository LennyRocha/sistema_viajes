import { Module } from '@nestjs/common';

import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { ComprasExpiracionService } from './compras-expiracion.service';
import { SalidasModule } from '../salidas/salidas.module';

@Module({
    imports: [
        PrismaModule,
        RedisModule,
        SalidasModule,
    ],
    controllers: [ComprasController],
    providers: [ComprasService, ComprasExpiracionService],
    exports: [ComprasService],
})
export class ComprasModule {}
