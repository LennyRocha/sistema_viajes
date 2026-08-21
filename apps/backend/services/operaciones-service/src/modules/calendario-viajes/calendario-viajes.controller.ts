import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalendarioViajesService } from './calendario-viajes.service';
import { CalendarioMesQueryDto } from './dtos/calendario-mes-query.dto';

@ApiTags('Calendario de viajes')
@Controller('calendario-viajes')
export class CalendarioViajesController {
  constructor(private readonly calendario: CalendarioViajesService) {}

  @Get('mes')
  @ApiOperation({ summary: 'Consultar calendario mensual de salidas' })
  getMonth(@Query() query: CalendarioMesQueryDto) {
    return this.calendario.getMonth(query);
  }
}
