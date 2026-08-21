import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SalidasService } from './salidas.service';
import { CreateSalidaDto } from './dtos/create-salida.dto';
import { UpdateSalidaDto } from './dtos/update-salida.dto';

@ApiTags('Salidas')
@Controller('salidas')
export class SalidasController {
  constructor(
    private readonly salidas: SalidasService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Crear salida',
  })
  @ApiResponse({
    status: 201,
    description: 'Salida creada correctamente',
  })
  create(@Body() dto: CreateSalidaDto) {
    return this.salidas.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar salidas' })
  findAll(
    @Query('conductorId', new DefaultValuePipe(0), ParseIntPipe)
    conductorId: number,
  ) {
    return this.salidas.findAll(conductorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener salida por id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('conductorId', new DefaultValuePipe(0), ParseIntPipe)
    conductorId: number,
  ) {
    return this.salidas.findOne(id, conductorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Reasignar salida' })
  @ApiParam({ name: 'id', example: 1 })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalidaDto) {
    return this.salidas.update(id, dto);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar salida' })
  @ApiParam({ name: 'id', example: 1 })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.salidas.cancel(id);
  }
}
