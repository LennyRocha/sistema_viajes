import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class GeoPointDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsString()
  @MaxLength(500)
  direccion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  placeId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  tiempoParadaMin?: number;
}
