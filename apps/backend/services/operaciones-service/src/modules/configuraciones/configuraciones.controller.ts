import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ConfiguracionesService } from './configuraciones.service';
import { UpdateConfiguracionDto } from './dtos/update-configuracion.dto';

@ApiTags('Configuraciones de operaciones')
@Controller('configuraciones-operaciones')
export class ConfiguracionesController {
  constructor(private readonly configuraciones: ConfiguracionesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar configuraciones de operaciones' })
  findAll() {
    return this.configuraciones.findAll();
  }

  @Get(':clave')
  @ApiOperation({ summary: 'Obtener configuracion por clave' })
  @ApiParam({ name: 'clave', example: 'rutas.toleranciaConexionMetros' })
  findOne(@Param('clave') clave: string) {
    return this.configuraciones.findOne(clave);
  }

  @Patch(':clave')
  @ApiOperation({ summary: 'Actualizar configuracion por clave' })
  upsert(@Param('clave') clave: string, @Body() dto: UpdateConfiguracionDto) {
    return this.configuraciones.upsert(clave, dto);
  }
}
