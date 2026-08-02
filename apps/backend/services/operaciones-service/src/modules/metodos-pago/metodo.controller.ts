import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { MetodosPagoService } from "./metodo.service";
import {
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Métodos de Pago")
@Controller("metodos-pago")
export class MetodosPagoController {
  constructor(
    private readonly metodosPagoService: MetodosPagoService,
  ) {}

  @ApiOperation({
    summary: "Listar todos los métodos de pago",
  })
  @Get()
  findAll() {
    return this.metodosPagoService.findAll();
  }

  @ApiOperation({
    summary: "Obtener método de pago por id",
  })
  @ApiParam({ name: "id", example: "1" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.metodosPagoService.findOne(id);
  }
}
