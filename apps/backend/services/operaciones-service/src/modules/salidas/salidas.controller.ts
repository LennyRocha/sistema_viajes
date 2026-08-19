import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { SalidasService } from "./salidas.service";
import { CreateSalidaDto } from "./dtos/create-salida.dto";
import { UpdateSalidaDto } from "./dtos/update-salida.dto";

@ApiTags("Salidas")
@Controller("salidas")
export class SalidasController {
  constructor(private readonly salidas: SalidasService) {}

  @Post()
  @ApiOperation({
    summary: "Crear salida",
  })
  @ApiResponse({
    status: 201,
    description: "Salida creada correctamente",
  })
  create(@Body() dto: CreateSalidaDto) {
    return this.salidas.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar salidas" })
  findAll() {
    return this.salidas.findAll();
  }

  @Get("buscar")
  @ApiOperation({
    summary: "Listar salidas según los filtros",
  })
  @ApiQuery({ name: "from", example: "1" })
  @ApiQuery({ name: "institucionId", example: "1" })
  findSalidas(
    @Query("from", new DefaultValuePipe(undefined))
    from: string,
    @Query("to", new DefaultValuePipe(undefined))
    to: string,
    @Query("fromId", new DefaultValuePipe(undefined))
    fromId: string,
    @Query("toId", new DefaultValuePipe(undefined))
    toId: string,
    @Query("fechaIda", new DefaultValuePipe(undefined))
    fechaIda: string,
    @Query("fechaVuelta", new DefaultValuePipe(undefined))
    fechaVuelta: string,
    @Query(
      "pasajeros",
      new DefaultValuePipe(1),
      ParseIntPipe,
    )
    pasajeros: number,
  ) {
    return this.salidas.findSalidas(
      from,
      to,
      fromId,
      toId,
      fechaIda,
      fechaVuelta,
      pasajeros,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener salida por id" })
  @ApiParam({ name: "id", example: 1 })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.salidas.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Reasignar salida" })
  @ApiParam({ name: "id", example: 1 })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSalidaDto,
  ) {
    return this.salidas.update(id, dto);
  }

  @Patch(":id/cancelar")
  @ApiOperation({ summary: "Cancelar salida" })
  @ApiParam({ name: "id", example: 1 })
  cancel(@Param("id", ParseIntPipe) id: number) {
    return this.salidas.cancel(id);
  }
}
