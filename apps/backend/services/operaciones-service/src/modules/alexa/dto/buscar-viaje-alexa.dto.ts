import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class BuscarViajeAlexaDto {
  @IsString()
  @IsNotEmpty()
  origen!: string;

  @IsString()
  @IsNotEmpty()
  destino!: string;

  @IsDateString()
  fecha!: string;
}
