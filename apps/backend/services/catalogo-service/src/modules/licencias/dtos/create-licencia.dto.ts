import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLicenciaDto {


  @IsNotEmpty({ message: 'El número de licencia es obligatorio' })
  @MaxLength(30, {
    message: 'El número de licencia no puede exceder los 30 caracteres',
  })
  numero_licencia!: string;

  @IsNotEmpty({ message: 'La categoría de la licencia es obligatoria' })
  @MaxLength(20, {
    message: 'La categoría no puede exceder los 20 caracteres',
  })
  categoria!: string;

  @IsNotEmpty({ message: 'La fecha de expedición es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de expedición debe tener un formato válido' },
  )
  fecha_expedicion!: Date;

  @IsNotEmpty({ message: 'La fecha de vencimiento es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe tener un formato válido' },
  )
  fecha_vencimiento!: Date;

  @IsNotEmpty({ message: 'El estado emisor es obligatorio' })
  @MaxLength(100, {
    message: 'El estado emisor no puede exceder los 100 caracteres',
  })
  estado_emisor!: string;

  @IsNotEmpty({ message: 'La imagen de la licencia es obligatoria' })
  @IsString({
    message: 'La imagen de la licencia debe ser una cadena de texto',
  })
  @MaxLength(3_000_000, {
    message: 'La imagen de la licencia no puede exceder el tamano permitido',
  })
  imagen_licencia!: string;

  @IsBoolean({
    message: 'El estado de vigencia debe ser un valor booleano',
  })
  vigente!: boolean;
}
