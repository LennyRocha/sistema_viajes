import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
} from "class-validator";

export class RegistrarSalidaAlexaDto {
  @IsString()
  @IsNotEmpty()
  viajeBaseNombre!: string;

  @IsDateString()
  fechaSalida!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  horaSalida!: string;

  @IsString()
  @IsNotEmpty()
  autobusAlias!: string;

  @IsString()
  @IsNotEmpty()
  conductorNombre!: string;
}
