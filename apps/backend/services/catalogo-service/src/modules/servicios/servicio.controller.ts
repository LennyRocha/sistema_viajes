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

  @Post('/disponibilidad/:id')
  @ApiOperation({ summary: 'Actualizar disponibilidad del servicio' })
  @ApiParam({ name: 'id', example: '1' })
  updateAvailability(@Param('id') id: number, @Body() dto: any) {
    return {
      id,
      dto,
      message:
        'Aquí se actualizara que instituciones tienen este servicio disponible',
    };
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
}
