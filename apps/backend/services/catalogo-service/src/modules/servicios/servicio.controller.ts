import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dtos/create-servicio.dto';
import { UpdateServicioDto } from './dtos/update-servicio.dto';
import { SetDisponibilidadDto } from './dtos/set-disponibildad.dto';

@ApiTags('servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly servicios: ServiciosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear servicio' })
  create(@Body() dto: CreateServicioDto) {
    return this.servicios.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los servicios' })
  findAll() {
    return this.servicios.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener servicio por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id') id: number) {
    return this.servicios.findOne(id);
  }

  @Get('/nombre/:nombre')
  @ApiOperation({ summary: 'Obtener servicio por nombre' })
  @ApiParam({ name: 'nombre', example: 'Wi-Fi' })
  findOneName(@Param('nombre') nombre: string) {
    return this.servicios.findOneName(nombre);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar servicio' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id') id: number, @Body() dto: UpdateServicioDto) {
    return this.servicios.update(id, dto);
  }

  @Delete('/status/:id')
  @ApiOperation({ summary: 'Cambiar estado de un  servicio' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id') id: number) {
    return this.servicios.shutdown(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar servicio' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id') id: number) {
    return this.servicios.remove(id);
  }

  //Disponibilidad de servicios

  @Get('/disponibilidad')
  @ApiOperation({ summary: 'Consultar disponibilidad de servicios' })
  checkAvailabilityAll() {
    return {
      message:
        'Aquí se veran que instituciones tienen cada servicio disponible',
    };
  }

  @Get('/disponibilidad/:id')
  @ApiOperation({ summary: 'Verificar disponibilidad del servicio' })
  @ApiParam({ name: 'id', example: '1' })
  checkAvailability(@Param('id') id: number) {
    return {
      id,
      message:
        'Aquí se veran que instituciones tienen este servicio disponible',
    };
  }

  @Post('/disponibilidad')
  @ApiOperation({
    summary: 'Límitar disponibilidad de un servicio dentro de una institución',
  })
  updateAvailability(@Body() dto: SetDisponibilidadDto) {
    return {
      dto,
      message:
        'Se limitó la disponibilidad de este servicio para la institución correspondiente',
    };
  }

  @Delete('/disponibilidad/:id')
  @ApiOperation({
    summary:
      'Activar/desactivar disponibilidad de un servicio para una institución',
  })
  @ApiParam({ name: 'id', example: '1' })
  shutdownAvailability(@Param('id') id: number) {
    return {
      id,
      message:
        'Se desactivara la disponibilidad de este servicio para la institución correspondiente',
    };
  }
}
