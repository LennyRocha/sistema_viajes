import {
  IsDateString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLicenciaDto } from 'src/modules/licencias/dtos/create-licencia.dto';

export class CreateConductorDto {
  // ==========================
  // Datos del conductor
  // ==========================

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre no puede exceder los 100 caracteres',
  })
  nombres!: string;

  @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
  @MaxLength(100, {
    message: 'El apellido paterno no puede exceder los 100 caracteres',
  })
  apellido_paterno!: string;

  @IsNotEmpty({ message: 'El apellido materno es obligatorio' })
  @MaxLength(100, {
    message: 'El apellido materno no puede exceder los 100 caracteres',
  })
  apellido_materno!: string;

  @IsNotEmpty({ message: 'La CURP es obligatoria' })
  @MaxLength(18, {
    message: 'La CURP debe contener 18 caracteres',
  })
  curp!: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe ser válida' },
  )
  fecha_nacimiento!: Date;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(15, {
    message: 'El teléfono no puede exceder los 15 caracteres',
  })
  telefono!: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @MaxLength(150, {
    message: 'El correo electrónico no puede exceder los 150 caracteres',
  })
  email!: string;

  @IsNotEmpty({ message: 'La foto de perfil es obligatoria' })
  @MaxLength(255, {
    message: 'La ruta de la foto no puede exceder los 255 caracteres',
  })
  foto_perfil!: string;

  @IsNotEmpty({ message: 'La institución es obligatoria' })
  institucion_id!: number;

  // ==========================
  // Datos de la licencia
  // ==========================

  @IsNotEmpty({ message: 'La licencia es obligatoria' })
  @ValidateNested()
  @Type(() => CreateLicenciaDto)
  licencia!: CreateLicenciaDto;
}