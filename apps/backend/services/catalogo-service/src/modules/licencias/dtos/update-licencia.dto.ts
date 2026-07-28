import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateLicenciaDto {
  @IsOptional()
  @IsNumber({}, { message: 'El ID del conductor debe ser un número' })
  conductor_id?: number;

  @IsOptional()
  @MaxLength(30, {
    message: 'El número de licencia no puede exceder los 30 caracteres',
  })
  numero_licencia?: string;

  @IsOptional()
  @MaxLength(20, {
    message: 'La categoría no puede exceder los 20 caracteres',
  })
  categoria?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de expedición debe tener un formato válido' },
  )
  fecha_expedicion?: Date;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe tener un formato válido' },
  )
  fecha_vencimiento?: Date;

  @IsOptional()
  @MaxLength(100, {
    message: 'El estado emisor no puede exceder los 100 caracteres',
  })
  estado_emisor?: string;

  @IsOptional()
  @IsString({
    message: 'La imagen de la licencia debe ser una cadena de texto',
  })
  @MaxLength(255, {
    message: 'La ruta de la imagen no puede exceder los 255 caracteres',
  })
  imagen_licencia?: string;

  @IsOptional()
  @IsBoolean({
    message: 'La vigencia debe ser un valor booleano',
  })
  vigente?: boolean;
}