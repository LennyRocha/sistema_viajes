import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Estado } from '@prisma/client';
import { AutobusServicioDto } from './autobus-servicio.dto';
import { IsUniqueObjectArray } from '@commons/decorators';
import { AsientoDto } from './asiento.dto';

export class CreateAutobusDto {
  @IsNotEmpty({ message: 'El código interno del autobús es obligatorio' })
  @MaxLength(10, {
    message: 'El código interno no puede exceder los 10 caracteres',
  })
  codigo_interno!: string;
  @IsNotEmpty({ message: 'La marca del autobús es obligatoria' })
  @MaxLength(50, {
    message: 'La marca no puede exceder los 50 caracteres',
  })
  marca!: string;
  @IsNotEmpty({ message: 'El alias del autobús es obligatorio' })
  @MaxLength(25, {
    message: 'El alias no puede exceder los 25 caracteres',
  })
  alias!: string;
  @IsNotEmpty({ message: 'El modelo del autobús es obligatorio' })
  @MaxLength(50, {
    message: 'El modelo no puede exceder los 50 caracteres',
  })
  modelo!: string;
  @IsNotEmpty({ message: 'El año del autobús es obligatorio' })
  @Min(1950, { message: 'El año del autobús debe ser mayor o igual a 1950' })
  @Max(new Date().getFullYear(), {
    message: `El año del autobús debe ser menor o igual a ${new Date().getFullYear()}`,
  })
  ano!: number;
  @IsNotEmpty({ message: 'La capacidad del autobús es obligatoria' })
  @Min(1, { message: 'La capacidad del autobús debe ser mayor o igual a 1' })
  @Max(44, {
    message: 'La capacidad del autobús debe ser menor o igual a 44',
  })
  capacidad!: number;
  @IsNotEmpty({ message: 'El estado del autobús es obligatorio' })
  @IsEnum(Estado, {
    message: `El estado del autobús debe ser uno de los siguientes valores: ${Object.values(
      Estado,
    ).join(', ')}`,
  })
  estado!: Estado;
  @IsNotEmpty({ message: 'El color del autobús es obligatorio' })
  color!: string;
  @IsNotEmpty({ message: 'La descripción del autobús es obligatoria' })
  @MaxLength(255, {
    message: 'La descripción no puede exceder los 255 caracteres',
  })
  descripcion!: string;
  @IsNotEmpty({ message: 'El ID de la institución es obligatorio' })
  institucion_id!: number;
  @IsNotEmpty({ message: 'El ID del tipo de autobús es obligatorio' })
  tipo_autobus_id!: number;
  @IsNotEmpty({ message: 'Los asientos del autobús son obligatorios' })
  @IsArray({ message: 'Los asientos del autobús deben ser un arreglo' })
  @ArrayMinSize(1, {
    message: 'El autobús debe tener al menos 1 asiento',
  })
  @ArrayMaxSize(44, {
    message: 'El autobús no puede tener más de 44 asientos',
  })
  @IsUniqueObjectArray('id', {
    message: 'Los asientos del autobús deben ser únicos',
  })
  asientos!: AsientoDto[];
  @IsNotEmpty({ message: 'Los servicios del autobús son obligatorios' })
  @IsArray({ message: 'Los servicios del autobús deben ser un arreglo' })
  @IsUniqueObjectArray('servicio_id', {
    message: 'Los servicios del autobús deben ser únicos',
  })
  @ArrayMaxSize(10, {
    message: 'El autobús no puede tener más de 10 servicios',
  })
  @ArrayMinSize(1, {
    message: 'El autobús debe tener al menos 1 servicio',
  })
  servicios!: AutobusServicioDto[];
}
