import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateViajeBaseDto } from './dtos/create-viaje-base.dto';
import { UpdateViajeBaseDto } from './dtos/update-viaje-base.dto';
import { ViajesBaseService } from './viajes-base.service';

@ApiTags('Viajes base')
@Controller('viajes-base')
export class ViajesBaseController {
  constructor(private readonly viajes: ViajesBaseService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear viaje base con rutas asociadas' })
  create(@Body() dto: CreateViajeBaseDto) {
    return this.viajes.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar viajes base' })
  @ApiQuery({ name: 'active', required: false, example: true })
  findAll(
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.viajes.findAll(active);
  }

  @Get('validar-conexion')
  @ApiOperation({ summary: 'Validar si una lista ordenada de rutas conecta' })
  @ApiQuery({ name: 'rutaIds', example: '1,2,3' })
  validar(
    @Query('rutaIds', new ParseArrayPipe({ items: Number, separator: ',' }))
    rutaIds: number[],
  ) {
    return this.viajes.validar(rutaIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener viaje base por id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.viajes.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar viaje base' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateViajeBaseDto,
  ) {
    return this.viajes.update(id, dto);
  }

  @Delete('/status/:id')
  @ApiOperation({ summary: 'Cambiar estatus de viaje base' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.viajes.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar viaje base' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.viajes.remove(id);
  }
}
