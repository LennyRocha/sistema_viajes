import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateConfiguracionDto {
  @IsNotEmpty()
  valor!: unknown;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}
