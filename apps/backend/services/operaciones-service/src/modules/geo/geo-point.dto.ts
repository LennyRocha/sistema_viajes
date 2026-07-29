import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
