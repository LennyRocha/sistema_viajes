import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { GeoPointDto } from '../../geo/geo-point.dto';

export class ViajeBaseRutaDto {
  @IsInt()
  rutaId!: number;

  @IsInt()
  orden!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeoPointDto)
  conexion?: GeoPointDto[];

  @IsOptional()
  @IsString()
  conexionEncodedPolyline?: string;

  @IsOptional()
  @IsInt()
  distanciaConexionMetros?: number;
}
