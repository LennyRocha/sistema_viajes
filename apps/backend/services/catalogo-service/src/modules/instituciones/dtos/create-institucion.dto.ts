import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class CreateInstitucionDto {
  @ApiProperty({
    description: 'El nombre de la institución',
    example: 'Institución ABC',
  })
  @IsNotEmpty({ message: 'El nombre de la institución es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre de la institución no puede exceder los 100 caracteres',
  })
  nombre!: string;
  @ApiProperty({
    description: 'La descripción de la institución',
    example: 'Esta es una institución educativa.',
  })
  @IsNotEmpty({ message: 'La descripción de la institución es obligatoria' })
  @MaxLength(255, {
    message:
      'La descripción de la institución no puede exceder los 255 caracteres',
  })
  descripcion!: string;
  @ApiProperty({
    description: 'La URL de la imagen de la institución',
    example: 'https://ejemplo.com/imagen.png',
  })
  @IsNotEmpty({
    message: 'La URL de la imagen de la institución es obligatoria',
  })
  @MaxLength(255, {
    message:
      'La URL de la imagen de la institución no puede exceder los 255 caracteres',
  })
  @IsUrl({}, { message: 'La URL de la imagen de la institución no es válida' })
  imagen_url!: string;
}
