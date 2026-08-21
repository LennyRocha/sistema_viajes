import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from "class-validator";

export class ComprarBoletoAlexaDto {
  @IsString()
  @IsNotEmpty()
  origen!: string;

  @IsString()
  @IsNotEmpty()
  destino!: string;

  @IsDateString()
  fecha!: string;

  @IsInt()
  @Min(1)
  pasajeros!: number;

  @IsString()
  @IsNotEmpty()
  nombreComprador!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  metodoPago!: string;
}
