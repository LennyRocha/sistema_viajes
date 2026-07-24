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
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DisponibilidadServiciosService } from './disponibilidad-servicios.service';
import { SetDisponibilidadDto } from './dto/set-disponibildad.dto';

@Controller('disponibilidad-servicios')
@ApiTags('Disponibilidad de servicios')
export class DisponibilidadServiciosController {
  constructor(
    private readonly disponibilidades: DisponibilidadServiciosService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Consultar disponibilidad de servicios' })
  getAllAvailability() {
    return this.disponibilidades.findAll();
  }

  @Get('disponibles')
  @ApiOperation({
    summary:
      'Obtener servicios disponibles para una institución y un tipo de autobús',
  })
  @ApiQuery({ name: 'tipoBusId', example: '1' })
  @ApiQuery({ name: 'institucionId', example: '1' })
  findServiciosDisponibles(
    @Query('tipoBusId', ParseIntPipe) tipoBusId: number,
    @Query('institucionId', ParseIntPipe) institucionId: number,
  ) {
    return this.disponibilidades.findServiciosDisponibles(
      tipoBusId,
      institucionId,
    );
  }

  @Get('/servicio/:id')
  @ApiOperation({
    summary: 'Verificar disponibilidad del servicio por  institución',
  })
  @ApiParam({ name: 'id', example: '1' })
  @ApiQuery({ name: 'institucionId', example: '1' })
  @ApiQuery({ name: 'showActiveOnly', example: 'true' })
  checkByServicio(
    @Param('id', ParseIntPipe) id: number,
    @Query('showActiveOnly', new DefaultValuePipe(true), ParseBoolPipe)
    showActiveOnly: boolean,
  ) {
    return this.disponibilidades.findAllByServicio(id, showActiveOnly);
  }

  @Get('/institucion/:id')
  @ApiOperation({
    summary:
      'Verificar disponibilidad de servicios por institución en distintos tipos de autobuses',
  })
  @ApiParam({ name: 'id', example: '1' })
  @ApiQuery({ name: 'showActiveOnly', example: 'true' })
  checkByInstitucion(
    @Param('id', ParseIntPipe) id: number,
    @Query('showActiveOnly', new DefaultValuePipe(true), ParseBoolPipe)
    showActiveOnly: boolean,
  ) {
    return this.disponibilidades.findAllByInstitucion(id, showActiveOnly);
  }

  @Get('/autobus/:id')
  @ApiOperation({
    summary:
      'Verificar disponibilidad de servicios  por tipo de autobús en distintas instituciones',
  })
  @ApiParam({ name: 'id', example: '1' })
  @ApiQuery({ name: 'showActiveOnly', example: 'true' })
  checkByTipo(
    @Param('id', ParseIntPipe) id: number,
    @Query('showActiveOnly', new DefaultValuePipe(true), ParseBoolPipe)
    showActiveOnly: boolean,
  ) {
    return this.disponibilidades.findAllByTipo(id, showActiveOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Verificar disponibilidad del servicio' })
  @ApiParam({ name: 'id', example: '1' })
  checkAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidades.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Límitar disponibilidad de un servicio dentro de una institución',
  })
  setAvailability(@Body() dto: SetDisponibilidadDto) {
    return this.disponibilidades.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Activar/desactivar disponibilidad de un servicio para una institución',
  })
  @ApiParam({ name: 'id', example: '1' })
  shutdownAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidades.shutdown(id);
  }
}
