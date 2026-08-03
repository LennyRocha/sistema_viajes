import {
  IsOptional,
  MaxLength,
  IsDateString,
  IsNumber,
} from 'class-validator';
export class UpdateConductorDto {
  // ==========================
  // Datos del conductor
  // ==========================

  @IsOptional()
  @MaxLength(100)
  nombres?: string;

  @IsOptional()
  @MaxLength(100)
  apellido_paterno?: string;

  @IsOptional()
  @MaxLength(100)
  apellido_materno?: string;

  @IsOptional()
  @MaxLength(18)
  curp?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: Date;

  @IsOptional()
  @MaxLength(15)
  telefono?: string;

  @IsOptional()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @MaxLength(3_000_000, {
    message: 'La foto de perfil no puede exceder el tamano permitido',
  })
  foto_perfil?: string;

  @IsOptional()
  @IsNumber()
  institucion_id?: number;


}
