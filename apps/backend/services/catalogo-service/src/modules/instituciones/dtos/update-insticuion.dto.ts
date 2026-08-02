import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateInstitucionDto {
  @ApiPropertyOptional({
    description: 'El nombre de la institución',
    example: 'Institución ABC',
  })
  @IsOptional()
  @MaxLength(100, {
    message: 'El nombre de la institución no puede exceder los 100 caracteres',
  })
  nombre!: string;
  @ApiPropertyOptional({
    description: 'La descripción de la institución',
    example: 'Esta es una institución educativa.',
  })
  @IsOptional()
  @MaxLength(255, {
    message:
      'La descripción de la institución no puede exceder los 255 caracteres',
  })
  descripcion!: string;
  @ApiPropertyOptional({
    description: 'La URL de la imagen de la institución',
    example: 'https://ejemplo.com/imagen.png',
  })
  @IsOptional()
  @MaxLength(255, {
    message:
      'La URL de la imagen de la institución no puede exceder los 255 caracteres',
  })
  @IsUrl({}, { message: 'La URL de la imagen de la institución no es válida' })
  imagen_url!: string;
}
