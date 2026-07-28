import {
  IsOptional,
  MaxLength,
  IsDateString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UpdateLicenciaDto } from 'src/modules/licencias/dtos/update-licencia.dto';
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
  @MaxLength(255)
  foto_perfil?: string;

  @IsOptional()
  @IsNumber()
  institucion_id?: number;

  // ==========================
  // Datos de la licencia vigente
  // ==========================

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLicenciaDto)
  licencia?: UpdateLicenciaDto;
}