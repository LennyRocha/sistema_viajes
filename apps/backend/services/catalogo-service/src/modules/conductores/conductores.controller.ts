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
import { ConductoresService } from './conductores.service';
import { CreateConductorDto } from './dtos/create-conductor.dto';
import { UpdateConductorDto } from './dtos/update-conductor.dto';

@ApiTags('conductores')
@Controller('conductores')
export class ConductoresController {
  constructor(private readonly conductores: ConductoresService) { }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear conductor' })
  create(@Body() dto: CreateConductorDto) {
    return this.conductores.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los conductores' })
  @ApiQuery({ name: 'active', example: true })
  findAll(
    @Query('institucion', new DefaultValuePipe(0), ParseIntPipe)
    institucion: number,
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.conductores.findAll(active, institucion);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener conductor por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conductores.findOne(id);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Obtener conductor por usuario' })
  findByUsuarioId(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.conductores.findByUsuarioId(usuarioId);
  }

  @Get('/salidas/:id')
  @ApiOperation({
    summary: 'Obtener conductor para módulo de salidas',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  findConductorSalida(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.conductores.findConductorSalida(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar conductor' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConductorDto,
  ) {
    return this.conductores.update(id, dto);
  }

  @Delete('/status/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cambiar estado de un conductor' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.conductores.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar conductor' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conductores.remove(id);
  }
}
