import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { GeoPointDto } from '../../geo/geo-point.dto';

export class CreateRutaDto {
  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  origen!: GeoPointDto;

  @ValidateNested()
  @Type(() => GeoPointDto)
  destino!: GeoPointDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeoPointDto)
  paradas!: GeoPointDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeoPointDto)
  waypoints?: GeoPointDto[];

  @IsOptional()
  @IsString()
  encodedPolyline?: string;

  @IsOptional()
  @IsInt()
  distanciaMetros?: number;

  @IsOptional()
  @IsInt()
  duracionSegundos?: number;

  @IsOptional()
  @IsBoolean()
  estatus?: boolean;
}
