import { Module } from '@nestjs/common';
import {
  ReportesController,
  ReportesInternalController,
} from './reportes.controller';
import { InternalServiceGuard } from './internal-service.guard';
import { ReportesService } from './reportes.service';

@Module({
  controllers: [ReportesController, ReportesInternalController],
  providers: [ReportesService, InternalServiceGuard],
})
export class ReportesModule {}
