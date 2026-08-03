import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
  findAll() {
    return this.salidas.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener salida por id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salidas.findOne(id);
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