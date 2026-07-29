import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateRutaDto } from './dtos/create-ruta.dto';
import { UpdateRutaDto } from './dtos/update-ruta.dto';
import { RutasService } from './rutas.service';

@ApiTags('Rutas')
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutas: RutasService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear ruta reusable' })
  create(@Body() dto: CreateRutaDto) {
    return this.rutas.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar rutas' })
  @ApiQuery({ name: 'active', required: false, example: true })
  findAll(
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.rutas.findAll(active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ruta por id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rutas.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ruta' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRutaDto) {
    return this.rutas.update(id, dto);
  }

  @Delete('/status/:id')
  @ApiOperation({ summary: 'Cambiar estatus de ruta' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.rutas.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar ruta' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rutas.remove(id);
  }
}
