import { Module } from '@nestjs/common';


import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { CompradoresController } from './comprador.controller';
import { CompradoresService } from './comprador.service';

@Module({
    imports: [
        PrismaModule,
        RedisModule,
    ],
    controllers: [CompradoresController],
    providers: [CompradoresService],
})
export class CompradorModule { }
