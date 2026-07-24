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
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dtos/create-servicio.dto';
import { UpdateServicioDto } from './dtos/update-servicio.dto';

@ApiTags('servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly servicios: ServiciosService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear servicio' })
  create(@Body() dto: CreateServicioDto) {
    return this.servicios.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los servicios' })
  @ApiQuery({ name: 'active', example: true })
  findAll(
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.servicios.findAll(active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener servicio por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id', ParseIntPipe) id: number) {
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicioDto,
  ) {
    return this.servicios.update(id, dto);
  }

  @Delete('/status/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cambiar estado de un  servicio' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.servicios.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar servicio' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicios.remove(id);
  }
}
