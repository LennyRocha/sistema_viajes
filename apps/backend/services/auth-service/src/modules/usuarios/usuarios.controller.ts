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
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { UpdateUsuarioDto } from './dtos/update-usuario.dto';
import { CreateUsuarioDto } from './dtos/create-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrivilegesGuard } from '../auth/guards/privileges.guard';
import { Privileges } from '../auth/decorators/privileges.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(JwtAuthGuard, PrivilegesGuard)
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Post()
  @HttpCode(201)
  @Privileges('usuarios:crear')
  @ApiOperation({ summary: 'Crear usuario' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuarios.create(dto);
  }

  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiQuery({ name: 'active', example: true })
  @Get()
  @Privileges('usuarios:consultar')
  findAll(
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.usuarios.findAll(active);
  }

  @Get('/email/:email')
  @Privileges('usuarios:consultar')
  @ApiOperation({ summary: 'Obtener usuario por correo electronico' })
  @ApiParam({ name: 'email', example: 'user@example.com' })
  findOneByEmail(@Param('email') email: string) {
    return this.usuarios.findOneByEmail(email);
  }

  @Get('/curp/:curp')
  @Privileges('usuarios:consultar')
  @ApiOperation({ summary: 'Obtener usuario por CURP' })
  @ApiParam({ name: 'curp', example: 'ABC123456DEF7890' })
  findOneByCurp(@Param('curp') curp: string) {
    return this.usuarios.findOneByCurp(curp);
  }

  @Get('/telefono/:telefono')
  @Privileges('usuarios:consultar')
  @ApiOperation({ summary: 'Obtener usuario por telefono' })
  @ApiParam({ name: 'telefono', example: '1234567890' })
  findOneByTelefono(@Param('telefono') telefono: string) {
    return this.usuarios.findOneByTelefono(telefono);
  }

  @ApiOperation({ summary: 'Obtener usuario por id' })
  @ApiParam({ name: 'id', example: '1' })
  @Get(':id')
  @Privileges('usuarios:consultar')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.findOne(id);
  }

  @Patch(':id')
  @Privileges('usuarios:editar')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usuarios.update(id, dto);
  }

  @Delete('/status/:id')
  @HttpCode(204)
  @Privileges('usuarios:estado')
  @ApiOperation({ summary: 'Cambiar estado de un usuario' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @Privileges('usuarios:eliminar')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.remove(id);
  }
}
