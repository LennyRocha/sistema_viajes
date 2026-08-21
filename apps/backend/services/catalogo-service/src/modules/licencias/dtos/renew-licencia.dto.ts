import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { LICENSE_CATEGORIES, MEXICAN_STATES } from '../licencia-options';

export class RenewLicenciaDto {
  @IsOptional()
  @Matches(/^\d{8,12}$/, {
    message: 'El numero de licencia debe contener entre 8 y 12 digitos',
  })
  numero_licencia?: string;

  @IsOptional()
  @IsIn(LICENSE_CATEGORIES, {
    message: 'La categoria de licencia no es valida',
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
  @IsIn(MEXICAN_STATES, {
    message: 'El estado emisor no es valido',
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
