import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

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
}
