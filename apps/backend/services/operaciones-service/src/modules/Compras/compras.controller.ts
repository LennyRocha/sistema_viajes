import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';

@ApiTags('Compras')
@Controller('compras')
export class ComprasController {
  constructor(private readonly compras: ComprasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear compra (reserva de asientos, estado pendiente)' })
  @ApiResponse({ status: 201, description: 'Compra creada correctamente' })
  create(@Body() dto: CreateCompraDto) {
    return this.compras.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar compras' })
  findAll() {
    return this.compras.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener compra por id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.compras.findOne(id);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar compra' })
  @ApiParam({ name: 'id', example: 1 })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.compras.cancel(id);
  }
}