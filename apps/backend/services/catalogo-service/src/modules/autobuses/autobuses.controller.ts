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
import { AutobusesService } from './autobuses.service';
import { CreateAutobusDto } from './dtos/create-autobus.dto';
import { UpdateAutobusDto } from './dtos/update-autobus.dto';

@ApiTags('autobuses')
@Controller('autobuses')
export class AutobusesController {
  constructor(private readonly autobuses: AutobusesService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear autobús' })
  create(@Body() dto: CreateAutobusDto) {
    return this.autobuses.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los autobuses' })
  @ApiQuery({ name: 'active', example: true })
  findAll(
    @Query('tipo_bus', new DefaultValuePipe(0), ParseIntPipe)
    tipo_bus: number,
    @Query('institucion', new DefaultValuePipe(0), ParseIntPipe)
    institucion: number,
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.autobuses.findAll(active, tipo_bus, institucion);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener autobús por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.autobuses.findOne(id);
  }

  @Get('/codigo/:codigo_interno')
  @ApiOperation({ summary: 'Obtener autobús por código interno' })
  @ApiParam({ name: 'codigo_interno', example: 'Wi-Fi' })
  findOneName(@Param('codigo_interno') codigo_interno: string) {
    return this.autobuses.findOneByCodigoInterno(codigo_interno);
  }

  @Get('/alias/:alias')
  @ApiOperation({ summary: 'Obtener autobús por alias' })
  @ApiParam({ name: 'alias', example: 'Wi-Fi' })
  findOneByAlias(@Param('alias') alias: string) {
    return this.autobuses.findOneByAlias(alias);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar autobús' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAutobusDto) {
    return this.autobuses.update(id, dto);
  }

  @Get('/salidas/:id')
  @ApiOperation({
    summary: 'Obtener autobús para módulo de salidas',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  findAutobusSalida(@Param('id', ParseIntPipe) id: number) {
    return this.autobuses.findAutobusSalida(id);
  }

  @Delete('/status/:id')
  @HttpCode(204)
  @ApiTags('autobuses')
  @ApiOperation({ summary: 'Cambiar estado de un  autobús' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.autobuses.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar autobús' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.autobuses.remove(id);
  }
}
