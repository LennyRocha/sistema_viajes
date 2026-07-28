import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCampoConfigDto } from './create-campo-config.dto';
import {
  IsUniqueObjectArray,
  MaxArraySize,
  MinArraySize,
} from '@commons/decorators';

export class UpdateServicioDto {
  @ApiPropertyOptional({
    example: 'Wi-Fi',
    description: 'El nombre del servicio',
  })
  @IsString()
  @IsOptional()
  @MinLength(5, {
    message: 'El nombre del servicio debe tener al menos 5 caracteres',
  })
  @MaxLength(100, {
    message: 'El nombre del servicio no puede exceder los 100 caracteres',
  })
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Servicio de Wi-Fi a bordo del autobús',
    description: 'La descripción del servicio',
  })
  @IsString()
  @IsOptional()
  @MinLength(20, {
    message: 'La descripción del servicio debe tener al menos 20 caracteres',
  })
  @MaxLength(500, {
    message: 'La descripción del servicio no puede exceder los 500 caracteres',
  })
  descripcion?: string;

  @ApiPropertyOptional({
    example: 'wifi',
    description:
      'Consulta la lista de iconos disponibles en https://fonts.google.com/icons',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, {
    message: 'El nombre del ícono no puede exceder los 50 caracteres',
  })
  icono_nombre?: string;

  @ApiPropertyOptional({
    example: [],
    description: 'Las propiedades del servicio',
    type: [CreateCampoConfigDto],
  })
  @IsOptional()
  @IsUniqueObjectArray<CreateCampoConfigDto>('clave', {
    message: 'Las propiedades del servicio deben ser únicas entre sí',
  })
  @MinArraySize(1, { message: 'Debe haber al menos una opción' })
  @MaxArraySize(20, { message: 'No puede haber más de 20 opciones' })
  @ValidateNested({ each: true })
  @Type(() => CreateCampoConfigDto)
  propiedades?: CreateCampoConfigDto[];
}
