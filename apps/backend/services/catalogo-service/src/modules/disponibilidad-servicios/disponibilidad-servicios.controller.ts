import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DisponibilidadServiciosService } from './disponibilidad-servicios.service';
import { SetDisponibilidadDto } from './dto/set-disponibildad.dto';

@Controller('disponibilidad-servicios')
@ApiTags('Disponibilidad de servicios')
export class DisponibilidadServiciosController {
  constructor(
    private readonly disponibilidades: DisponibilidadServiciosService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Consultar disponibilidad de servicios' })
  getAllAvailability() {
    return this.disponibilidades.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Verificar disponibilidad del servicio' })
  @ApiParam({ name: 'id', example: '1' })
  checkAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidades.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Límitar disponibilidad de un servicio dentro de una institución',
  })
  setAvailability(@Body() dto: SetDisponibilidadDto) {
    return this.disponibilidades.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Activar/desactivar disponibilidad de un servicio para una institución',
  })
  @ApiParam({ name: 'id', example: '1' })
  shutdownAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidades.shutdown(id);
  }
}
