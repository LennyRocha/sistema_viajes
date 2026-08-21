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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ConductoresService } from './conductores.service';
import { CreateConductorDto } from './dtos/create-conductor.dto';
import { UpdateConductorDto } from './dtos/update-conductor.dto';
import {
  ImageStorageService,
  UploadedImage,
} from './image-storage.service';

@ApiTags('conductores')
@Controller('conductores')
export class ConductoresController {
  constructor(
    private readonly conductores: ConductoresService,
    private readonly imageStorage: ImageStorageService,
  ) { }

  @Post('images')
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Subir imagen de conductor o licencia' })
  uploadImage(
    @UploadedFile() file: UploadedImage | undefined,
    @Body('category') category?: string,
  ) {
    return this.imageStorage.upload(file, category);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear conductor' })
  create(@Body() dto: CreateConductorDto) {
    return this.conductores.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los conductores' })
  @ApiQuery({ name: 'active', example: true })
  findAll(
    @Query('institucion', new DefaultValuePipe(0), ParseIntPipe)
    institucion: number,
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe)
    active: boolean,
  ) {
    return this.conductores.findAll(active, institucion);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener conductor por id' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conductores.findOne(id);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Obtener conductor por usuario' })
  findByUsuarioId(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.conductores.findByUsuarioId(usuarioId);
  }

  @Get('/salidas/:id')
  @ApiOperation({
    summary: 'Obtener conductor para módulo de salidas',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  findConductorSalida(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.conductores.findConductorSalida(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar conductor' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConductorDto,
  ) {
    return this.conductores.update(id, dto);
  }

  @Delete('/status/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cambiar estado de un conductor' })
  @ApiParam({ name: 'id', example: '1' })
  shutdown(@Param('id', ParseIntPipe) id: number) {
    return this.conductores.shutdown(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Dar de baja lógica a un conductor' })
  @ApiParam({ name: 'id', example: '1' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conductores.remove(id);
  }
}
