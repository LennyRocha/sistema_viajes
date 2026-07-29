import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

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
}
