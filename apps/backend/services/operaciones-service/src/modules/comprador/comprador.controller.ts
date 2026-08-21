import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CompradoresService } from './comprador.service';
import { CreateCompradorDto } from './dtos/create-comprador.dto';

@ApiTags('Compradores')
@Controller('compradores')
export class CompradoresController {
  constructor(private readonly compradores: CompradoresService) {}

  @Post()
  @ApiOperation({
    summary:
      'Registrar datos de contacto del comprador (usuario no logueado), o recuperarlos si email/teléfono ya existen',
  })
  @ApiResponse({ status: 201, description: 'Comprador registrado u obtenido' })
  findOrCreate(@Body() dto: CreateCompradorDto) {
    return this.compradores.findOrCreate(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comprador por id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.compradores.findOne(id);
  }
}