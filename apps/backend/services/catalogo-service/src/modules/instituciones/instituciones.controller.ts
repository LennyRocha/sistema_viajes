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
import { InstitucionesService } from './instituciones.service';
import { ApiOperation, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { UpdateInstitucionDto } from './dtos/update-insticuion.dto';
import { CreateInstitucionDto } from './dtos/create-institucion.dto';

@ApiTags('Instituciones')
@Controller('instituciones')
export class InstitucionesController {
  constructor(private readonly instituciones: InstitucionesService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear institución' })
  create(@Body() dto: CreateInstitucionDto) {
    return this.instituciones.create(dto);
  }

  @ApiOperation({ summary: 'Listar todas las instituciones' })
  @ApiQuery({ name: 'active', example: true })
  @Get()
  findAll(
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.instituciones.findAll(active);
  }

  @ApiOperation({
    summary: 'Listar todas las instituciones para la página de about',
  })
  @Get('public')
  findAllPublic() {
    return this.instituciones.findAllPublic();
  }

  @ApiOperation({ summary: 'Obtener institución por id' })
  @ApiParam({ name: 'id', example: '1' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instituciones.findOne(id);
  }

  @Get('/nombre/:nombre')
  @ApiOperation({ summary: 'Obtener institución por nombre' })
  @ApiParam({ name: 'nombre', example: 'Wi-Fi' })
  findOneName(@Param('nombre') nombre: string) {
    return this.instituciones.findOneByName(nombre);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar institución' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInstitucionDto,
  ) {
    return this.instituciones.update(id, dto);
  }

  @Delete('/status/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cambiar estado de una institución' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.instituciones.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminarinstitucion' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.instituciones.remove(id);
  }
}
