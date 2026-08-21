import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { LICENSE_CATEGORIES, MEXICAN_STATES } from '../licencia-options';

export class CreateLicenciaDto {


  @IsNotEmpty({ message: 'El número de licencia es obligatorio' })
  @Matches(/^\d{8,12}$/, {
    message: 'El numero de licencia debe contener entre 8 y 12 digitos',
  })
  numero_licencia!: string;

  @IsNotEmpty({ message: 'La categoría de la licencia es obligatoria' })
  @IsIn(LICENSE_CATEGORIES, {
    message: 'La categoria de licencia no es valida',
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
  @IsIn(MEXICAN_STATES, {
    message: 'El estado emisor no es valido',
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
