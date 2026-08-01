import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

import { SalidasService } from './salidas.service';
import { CreateSalidaDto } from './dtos/create-salida.dto';

@ApiTags('Salidas')
@Controller('salidas')
export class SalidasController {
  constructor(
    private readonly salidas: SalidasService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Crear salida',
  })
  @ApiResponse({
    status: 201,
    description: 'Salida creada correctamente',
  })
  create(@Body() dto: CreateSalidaDto) {
    return this.salidas.create(dto);
  }
}