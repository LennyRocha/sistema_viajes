import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateActividadReporteDto } from './dto/create-actividad-reporte.dto';
import { QueryActividadReporteDto } from './dto/query-actividad-reporte.dto';
import { InternalServiceGuard } from './internal-service.guard';
import { ReportesService } from './reportes.service';

@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Get('actividad')
  findActividad(@Query() query: QueryActividadReporteDto) {
    return this.reportes.findActividad(query);
  }
}

@ApiTags('Reportes internos')
@Controller('internal/reportes')
@UseGuards(InternalServiceGuard)
export class ReportesInternalController {
  constructor(private readonly reportes: ReportesService) {}

  @Post('actividad')
  @HttpCode(202)
  createActividad(@Body() dto: CreateActividadReporteDto) {
    return this.reportes.createActividad(dto);
  }
}
