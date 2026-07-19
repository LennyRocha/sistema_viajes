import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TiposAutobusService } from './tipo_bus.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Tipos de Autobús')
@Controller('tipos-autobus')
export class TiposAutobusController {
  constructor(private readonly tiposAutobusService: TiposAutobusService) {}

  @ApiOperation({ summary: 'Listar todos los tipos de autobús' })
  @Get()
  findAll() {
    return this.tiposAutobusService.findAll();
  }

  @ApiOperation({ summary: 'Obtener tipo de autobús por id' })
  @ApiParam({ name: 'id', example: '1' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiposAutobusService.findOne(id);
  }
}
