import { IsOptional, MaxLength } from 'class-validator';

export class UpdateInstitucionDto {
  @IsOptional()
  @MaxLength(100, {
    message: 'El nombre de la institución no puede exceder los 100 caracteres',
  })
  nombre!: string;
  @IsOptional()
  @MaxLength(255, {
    message:
      'La descripción de la institución no puede exceder los 255 caracteres',
  })
  descripcion!: string;
}
