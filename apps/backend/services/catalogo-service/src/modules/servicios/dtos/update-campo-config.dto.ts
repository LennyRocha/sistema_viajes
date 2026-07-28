import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { IsUniquePrimitiveArray } from '@commons/decorators';

export class UpdateCampoConfigDto {
  @ApiPropertyOptional({
    example: 'velocidad',
    description: 'La clave de la propiedad',
  })
  @IsString()
  @IsOptional()
  @MinLength(3, {
    message: 'La clave de la propiedad debe tener al menos 3 caracteres',
  })
  @MaxLength(50, {
    message: 'La clave de la propiedad no puede exceder los 50 caracteres',
  })
  clave?: string;

  @ApiPropertyOptional({
    example: 'Velocidad',
    description: 'El nombre de la propiedad',
  })
  @IsString()
  @IsOptional()
  @MinLength(3, {
    message: 'El nombre de la propiedad debe tener al menos 3 caracteres',
  })
  @MaxLength(50, {
    message: 'El nombre de la propiedad no puede exceder los 50 caracteres',
  })
  label?: string;

  @ApiPropertyOptional({
    example: 'string',
    enum: ['string', 'number', 'boolean'],
    description: 'El tipo de la propiedad',
  })
  @IsString()
  @IsOptional()
  tipo?: 'string' | 'number' | 'boolean';

  @ApiPropertyOptional({
    example: 'text',
    enum: [
      'text',
      'textarea',
      'number',
      'checkbox',
      'select',
      'radio',
      'switch',
    ],
    description: 'El tipo de input para la propiedad',
  })
  @IsOptional()
  @IsString()
  inputTipo?:
    'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'radio' | 'switch';

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el campo es requerido',
  })
  @IsOptional()
  @IsBoolean()
  @IsOptional()
  requerido?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'El valor mínimo para la propiedad',
  })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'El valor máximo para la propiedad',
  })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'La longitud mínima para la propiedad',
  })
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'La longitud máxima para la propiedad',
  })
  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @ApiPropertyOptional({
    example: '^[a-zA-Z0-9]+$',
    description: 'La expresión regular para la propiedad',
  })
  @IsOptional()
  @IsString()
  regex?: string;

  @ApiPropertyOptional({
    example: 'Ingrese un valor',
    description: 'El placeholder para la propiedad',
  })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional({
    example: 'default value',
    description: 'El valor por defecto para la propiedad',
  })
  @IsOptional()
  defaultValue?: string | number | boolean;

  @ApiPropertyOptional({
    example: { campo: 'tipo', valor: 'avanzado' },
    description: 'La visibilidad del campo',
  })
  @IsOptional()
  visible?: {
    campo: string;
    valor: string | number | boolean;
  };

  @ApiPropertyOptional({
    example: ['opcion1', 'opcion2'],
    description: 'Las opciones para el campo',
  })
  @IsOptional()
  @IsUniquePrimitiveArray({ message: 'Las opciones deben ser únicas' })
  opciones?: Array<string | number>;
}
