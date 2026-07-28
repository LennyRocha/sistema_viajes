import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { IsUniquePrimitiveArray, MinArraySize } from '@commons/decorators';

export class CreateCampoConfigDto {
  @ApiPropertyOptional({
    example: 'uuid',
    description:
      'El uuid del campo, si se proporciona, se actualizará el campo existente en lugar de crear uno nuevo',
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'El uuid debe ser un UUID válido' })
  uuid?: string;

  @ApiProperty({
    example: 'velocidad',
    description: 'La clave de la propiedad',
  })
  @IsString()
  @IsNotEmpty({ message: 'La clave de la propiedad es obligatoria' })
  @MinLength(3, {
    message: 'La clave de la propiedad debe tener al menos 3 caracteres',
  })
  @MaxLength(50, {
    message: 'La clave de la propiedad no puede exceder los 50 caracteres',
  })
  clave!: string;

  @ApiProperty({
    example: 'Velocidad',
    description: 'El nombre de la propiedad',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la propiedad es obligatorio' })
  @MinLength(3, {
    message: 'El nombre de la propiedad debe tener al menos 3 caracteres',
  })
  @MaxLength(50, {
    message: 'El nombre de la propiedad no puede exceder los 50 caracteres',
  })
  label!: string;

  @ApiProperty({
    example: 'string',
    enum: ['string', 'number', 'boolean'],
    description: 'El tipo de la propiedad',
  })
  @IsString()
  @IsNotEmpty({ message: 'El tipo de la propiedad es obligatorio' })
  tipo!: 'string' | 'number' | 'boolean';

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

  @ApiProperty({
    example: true,
    description: 'Indica si el campo es requerido',
  })
  @IsNotEmpty({ message: 'El campo requerido es obligatorio' })
  @IsBoolean()
  requerido!: boolean;

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
    description: 'La expresión regular para validar la propiedad',
  })
  @IsOptional()
  @IsString()
  regex?: string;

  @ApiPropertyOptional({
    example: 'Ingrese un valor',
    description: 'El texto de placeholder para la propiedad',
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
    description: 'La visibilidad de la propiedad',
  })
  @IsOptional()
  visible?: {
    campo: string;
    valor: string | number | boolean;
  };

  @ApiPropertyOptional({
    example: ['opcion1', 'opcion2'],
    description:
      'Las opciones para la propiedad, si es de tipo select, radio o checkbox',
  })
  @IsOptional()
  @IsUniquePrimitiveArray({ message: 'Las opciones deben ser únicas' })
  @MinArraySize(1, {
    message:
      'Debe haber al menos una opción, si estableciste como opcion de lista, de lo contrario no es necesario',
  })
  opciones?: Array<string | number>;
}
