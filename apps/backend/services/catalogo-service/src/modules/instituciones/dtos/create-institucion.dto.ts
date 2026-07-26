import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateInstitucionDto {
  @IsNotEmpty({ message: 'El nombre de la institución es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre de la institución no puede exceder los 100 caracteres',
  })
  nombre!: string;
  @IsNotEmpty({ message: 'La descripción de la institución es obligatoria' })
  @MaxLength(255, {
    message:
      'La descripción de la institución no puede exceder los 255 caracteres',
  })
  descripcion!: string;
}
