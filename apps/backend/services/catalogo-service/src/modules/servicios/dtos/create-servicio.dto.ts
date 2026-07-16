import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { CreateCampoConfigDto } from './create-campo-config.dto';
import {
  IsUniqueObjectArray,
  MaxArraySize,
  MinArraySize,
} from '@commons/decorators';

export class CreateServicioDto {
  @ApiProperty({ example: 'Wi-Fi' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del servicio es obligatorio' })
  @MinLength(5, {
    message: 'El nombre del servicio debe tener al menos 5 caracteres',
  })
  @MaxLength(50, {
    message: 'El nombre del servicio no puede exceder los 50 caracteres',
  })
  nombre!: string;

  @ApiProperty({ example: 'Servicio de Wi-Fi a bordo del autobús' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción del servicio es obligatoria' })
  @MinLength(20, {
    message: 'La descripción del servicio debe tener al menos 20 caracteres',
  })
  @MaxLength(500, {
    message: 'La descripción del servicio no puede exceder los 500 caracteres',
  })
  descripcion!: string;

  @ApiProperty({
    example: 'wifi',
    description:
      'Consulta la lista de iconos disponibles en https://fonts.google.com/icons',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del ícono es obligatorio' })
  @MaxLength(50, {
    message: 'El nombre del ícono no puede exceder los 50 caracteres',
  })
  icono_nombre!: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'Las propiedades del servicio son obligatorias' })
  @IsUniqueObjectArray<CreateCampoConfigDto>('clave', {
    message: 'Las propiedades del servicio deben ser únicas entre sí',
  })
  @MinArraySize(1, { message: 'Debe haber al menos una opción' })
  @MaxArraySize(20, { message: 'No puede haber más de 20 opciones' })
  propiedades!: CreateCampoConfigDto[];
}
