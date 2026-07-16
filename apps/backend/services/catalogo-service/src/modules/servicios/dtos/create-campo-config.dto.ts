import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { IsUniquePrimitiveArray, MinArraySize } from '@commons/decorators';

export class CreateCampoConfigDto {
  @IsOptional()
  @IsNumber()
  uuid?: number;

  @ApiProperty({ example: 'velocidad' })
  @IsString()
  @IsNotEmpty({ message: 'La clave de la propiedad es obligatoria' })
  @MinLength(3, {
    message: 'La clave de la propiedad debe tener al menos 3 caracteres',
  })
  @MaxLength(50, {
    message: 'La clave de la propiedad no puede exceder los 50 caracteres',
  })
  clave!: string;

  @ApiProperty({ example: 'Velocidad' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la propiedad es obligatorio' })
  @MinLength(3, {
    message: 'El nombre de la propiedad debe tener al menos 3 caracteres',
  })
  @MaxLength(50, {
    message: 'El nombre de la propiedad no puede exceder los 50 caracteres',
  })
  label!: string;

  @ApiProperty({ example: 'string', enum: ['string', 'number', 'boolean'] })
  @IsString()
  @IsNotEmpty({ message: 'El tipo de la propiedad es obligatorio' })
  tipo!: 'string' | 'number' | 'boolean';

  @ApiProperty({
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
  })
  @IsOptional()
  @IsString()
  inputTipo?:
    'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'radio' | 'switch';

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty({ message: 'El campo requerido es obligatorio' })
  requerido?: boolean;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiProperty({ example: 100 })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @ApiProperty({ example: 100 })
  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @ApiProperty({ example: '^[a-zA-Z0-9]+$' })
  @IsOptional()
  @IsString()
  regex?: string;

  @ApiProperty({ example: 'Ingrese un valor' })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({ example: 'default value' })
  @IsOptional()
  defaultValue?: string | number | boolean;

  @ApiProperty({ example: { campo: 'tipo', valor: 'avanzado' } })
  @IsOptional()
  visible?: {
    campo: string;
    valor: string | number | boolean;
  };

  @ApiProperty({ example: ['opcion1', 'opcion2'] })
  @IsOptional()
  @IsUniquePrimitiveArray({ message: 'Las opciones deben ser únicas' })
  @MinArraySize(1, {
    message:
      'Debe haber al menos una opción, si estableciste como opcion de lista, de lo contrario no es necesario',
  })
  opciones?: Array<string | number>;
}
