import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RutasController } from './rutas.controller';
import { RutasService } from './rutas.service';

@Module({
  imports: [PrismaModule],
  controllers: [RutasController],
  providers: [RutasService],
  exports: [RutasService],
})
export class RutasModule {}
