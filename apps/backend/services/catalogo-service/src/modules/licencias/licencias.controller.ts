import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LicenciasService } from './licencias.service';
import { CreateLicenciaAloneDto } from './dtos/create-licencia-alone.dto';
import { UpdateLicenciaDto } from './dtos/update-licencia.dto';

@ApiTags('licencias')
@Controller('licencias')
export class LicenciasController {
  constructor(private readonly licencias: LicenciasService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear licencia' })
  create(@Body() dto: CreateLicenciaAloneDto) {
    return this.licencias.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las licencias' })
  @ApiQuery({ name: 'vigente', required: false, example: true })
  @ApiQuery({ name: 'conductor', required: false, example: 1 })
  findAll(
    @Query('conductor', new DefaultValuePipe(0), ParseIntPipe)
    conductor: number,
    @Query('vigente') vigente?: string,
  ) {
    const vigenteFilter =
      vigente === undefined ? undefined : vigente === 'true';
    return this.licencias.findAll(vigenteFilter, conductor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener licencia por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.licencias.findOne(id);
  }

  @Get('/conductor/:conductor_id/vigente')
  @ApiOperation({ summary: 'Obtener la licencia vigente de un conductor' })
  @ApiParam({ name: 'conductor_id', example: '1' })
  findVigenteByConductor(
    @Param('conductor_id', ParseIntPipe) conductor_id: number,
  ) {
    return this.licencias.findVigenteByConductor(conductor_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar licencia' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLicenciaDto,
  ) {
    return this.licencias.update(id, dto);
  }

  @Delete('/status/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cambiar vigencia de una licencia' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.licencias.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar licencia' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.licencias.remove(id);
  }
}