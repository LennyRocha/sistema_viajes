import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AlexaService } from "./alexa.service";
import { CreateAlexaTokenDto } from "./dto/alexa-token.dto";
import { BuscarViajeAlexaDto } from "./dto/buscar-viaje-alexa.dto";
import { RegistrarSalidaAlexaDto } from "./dto/registrar-salida-alexa.dto";
import { ComprarBoletoAlexaDto } from "./dto/comprar-boleto-alexa.dto";

@ApiTags("Alexa")
@Controller("alexa")
export class AlexaController {
  constructor(private readonly alexa: AlexaService) {}

  @Post("auth/token")
  @HttpCode(200)
  @ApiOperation({
    summary: "Emitir token efimero de un solo uso para Alexa",
  })
  createToken(@Body() dto: CreateAlexaTokenDto) {
    return this.alexa.createOneTimeToken(dto.secret);
  }

  @Get("viajes/buscar")
  @ApiHeader({
    name: "x-alexa-token",
    required: true,
    description: "Token efimero de un solo uso",
  })
  @ApiOperation({
    summary: "Buscar viajes para el intent de Alexa",
  })
  buscarViajes(
    @Headers("x-alexa-token") token: string | undefined,
    @Query() query: BuscarViajeAlexaDto,
  ) {
    return this.alexa.buscarViajes(token, query);
  }

  @Post("salidas/registrar")
  @ApiHeader({
    name: "x-alexa-token",
    required: true,
    description: "Token efimero de un solo uso",
  })
  @ApiOperation({
    summary: "Registrar salida desde Alexa",
  })
  registrarSalida(
    @Headers("x-alexa-token") token: string | undefined,
    @Body() dto: RegistrarSalidaAlexaDto,
  ) {
    return this.alexa.registrarSalida(token, dto);
  }

  @Post("compras/comprar")
  @ApiHeader({
    name: "x-alexa-token",
    required: true,
    description: "Token efimero de un solo uso",
  })
  @ApiOperation({
    summary: "Comprar boleto desde Alexa",
  })
  comprarBoleto(
    @Headers("x-alexa-token") token: string | undefined,
    @Body() dto: ComprarBoletoAlexaDto,
  ) {
    return this.alexa.comprarBoleto(token, dto);
  }
}
