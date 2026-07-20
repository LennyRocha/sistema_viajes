import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InstitucionesService } from './instituciones.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Instituciones')
@Controller('instituciones')
export class InstitucionesController {
  constructor(private readonly institucionesService: InstitucionesService) {}

  @ApiOperation({ summary: 'Listar todas las instituciones' })
  @Get()
  findAll() {
    return this.institucionesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener institución por id' })
  @ApiParam({ name: 'id', example: '1' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.institucionesService.findOne(id);
  }
}
