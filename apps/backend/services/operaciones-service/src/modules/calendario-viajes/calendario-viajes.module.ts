import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CalendarioViajesController } from './calendario-viajes.controller';
import { CalendarioViajesService } from './calendario-viajes.service';

@Module({
  imports: [PrismaModule],
  controllers: [CalendarioViajesController],
  providers: [CalendarioViajesService],
})
export class CalendarioViajesModule {}
