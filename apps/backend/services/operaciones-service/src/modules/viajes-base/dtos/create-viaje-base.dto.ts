import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ViajeBaseRutaDto } from "./viaje-base-ruta.dto";
import { RutaTipo } from "../types/RutaTipo";

export class CreateViajeBaseDto {
  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  frecuencia?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracionCalculadaMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  margenMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracionTotalMin?: number;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  imagenBase64?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  imagenStorage?: string;

  @IsOptional()
  @IsBoolean()
  estatus?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ViajeBaseRutaDto)
  rutas!: ViajeBaseRutaDto[];

  @IsArray()
  @ArrayMinSize(1)
  config_rutas!: RutaTipo[];
}
