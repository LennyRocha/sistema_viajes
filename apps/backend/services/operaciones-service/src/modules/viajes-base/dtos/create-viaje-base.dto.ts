import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ViajeBaseRutaDto } from './viaje-base-ruta.dto';

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
  @IsBoolean()
  estatus?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ViajeBaseRutaDto)
  rutas!: ViajeBaseRutaDto[];
}
