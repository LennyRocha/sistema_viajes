import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InstitucionesService } from './instituciones.service';
import { ApiOperation, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Instituciones')
@Controller('instituciones')
export class InstitucionesController {
  constructor(private readonly institucionesService: InstitucionesService) {}

  @ApiOperation({ summary: 'Listar todas las instituciones' })
  @ApiQuery({ name: 'active', example: true })
  @Get()
  findAll(
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.institucionesService.findAll(active);
  }

  @ApiOperation({ summary: 'Obtener institución por id' })
  @ApiParam({ name: 'id', example: '1' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.institucionesService.findOne(id);
  }
}
