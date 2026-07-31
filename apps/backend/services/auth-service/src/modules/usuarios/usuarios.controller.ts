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
import { UsuariosService } from './usuarios.service';
import { ApiOperation, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { UpdateUsuarioDto } from './dtos/update-usuario.dto';
import { CreateUsuarioDto } from './dtos/create-usuario.dto';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear usuario' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuarios.create(dto);
  }

  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiQuery({ name: 'active', example: true })
  @Get()
  findAll(
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.usuarios.findAll(active);
  }

  @ApiOperation({ summary: 'Obtener usuario por id' })
  @ApiParam({ name: 'id', example: '1' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.findOne(id);
  }

  @Get('/email/:email')
  @ApiOperation({ summary: 'Obtener usuario por correo electrónico' })
  @ApiParam({ name: 'email', example: 'user@example.com' })
  findOneByEmail(@Param('email') email: string) {
    return this.usuarios.findOneByEmail(email);
  }

  @Get('/curp/:curp')
  @ApiOperation({ summary: 'Obtener usuario por CURP' })
  @ApiParam({ name: 'curp', example: 'ABC123456DEF7890' })
  findOneByCurp(@Param('curp') curp: string) {
    return this.usuarios.findOneByCurp(curp);
  }

  @Get('/telefono/:telefono')
  @ApiOperation({ summary: 'Obtener usuario por teléfono' })
  @ApiParam({ name: 'telefono', example: '1234567890' })
  findOneByTelefono(@Param('telefono') telefono: string) {
    return this.usuarios.findOneByTelefono(telefono);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usuarios.update(id, dto);
  }

  @Delete('/status/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cambiar estado de un usuario' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.remove(id);
  }
}
