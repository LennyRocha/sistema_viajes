import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RenewLicenciaDto {
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

  @IsDateString(
    {},
    { message: 'La fecha de expedición debe tener un formato válido' },
  )
  fecha_expedicion!: Date;

  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe tener un formato válido' },
  )
  fecha_vencimiento!: Date;

  @IsOptional()
  @MaxLength(100, {
    message: 'El estado emisor no puede exceder los 100 caracteres',
  })
  estado_emisor?: string;

  @IsString({
    message: 'La imagen de la licencia debe ser una cadena de texto',
  })
  @MaxLength(3_000_000, {
    message: 'La imagen de la licencia no puede exceder el tamano permitido',
  })
  imagen_licencia!: string;
}
