import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { PagosService } from "./pagos.service";
import { CreatePagoDto } from "./dto/pago.dto";
@ApiTags("Pagos")
@Controller("pagos")
export class PagosController {
  constructor(private readonly pagos: PagosService) {}

  @Post()
  @ApiOperation({ summary: "Registrar pago de una compra" })
  @ApiResponse({
    status: 201,
    description: "Pago procesado",
  })
  create(@Body() dto: CreatePagoDto) {
    return this.pagos.create(dto);
  }

  @Get(":compraId")
  @ApiOperation({
    summary: "Listar intentos de pago de una compra",
  })
  @ApiParam({ name: "compraId", example: 1 })
  findByCompra(
    @Param("compraId", ParseIntPipe) compraId: number,
  ) {
    return this.pagos.findByCompra(compraId);
  }
}
