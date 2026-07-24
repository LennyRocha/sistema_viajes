import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Estado } from '@prisma/client';
import { AutobusServicioDto } from './autobus-servicio.dto';
import { IsUniqueObjectArray } from '@commons/decorators';
import { AsientoDto } from './asiento.dto';

export class UpdateAutobusDto {
  @IsOptional()
  @MaxLength(10, {
    message: 'El código interno no puede exceder los 10 caracteres',
  })
  codigo_interno?: string;
  @IsOptional()
  @MaxLength(50, {
    message: 'La marca no puede exceder los 50 caracteres',
  })
  marca?: string;
  @IsOptional()
  @MaxLength(25, {
    message: 'El alias no puede exceder los 25 caracteres',
  })
  alias?: string;
  @IsOptional()
  @MaxLength(50, {
    message: 'El modelo no puede exceder los 50 caracteres',
  })
  modelo?: string;
  @IsOptional()
  @Min(1950, { message: 'El año del autobús debe ser mayor o igual a 1950' })
  @Max(new Date().getFullYear(), {
    message: `El año del autobús debe ser menor o igual a ${new Date().getFullYear()}`,
  })
  ano?: number;
  @IsOptional()
  @Min(1, { message: 'La capacidad del autobús debe ser mayor o igual a 1' })
  @Max(44, {
    message: 'La capacidad del autobús debe ser menor o igual a 44',
  })
  capacidad?: number;
  @IsOptional()
  @IsEnum(Estado, {
    message: `El estado del autobús debe ser uno de los siguientes valores: ${Object.values(
      Estado,
    ).join(', ')}`,
  })
  estado?: Estado;
  @IsOptional()
  color?: string;
  @IsOptional()
  @MaxLength(255, {
    message: 'La descripción no puede exceder los 255 caracteres',
  })
  descripcion?: string;
  @IsOptional()
  institucion_id?: number;
  @IsOptional()
  tipo_autobus_id?: number;
  @IsOptional()
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
  asientos?: AsientoDto[];
  @IsOptional()
  @IsArray({ message: 'Los servicios del autobús deben ser un arreglo' })
  @IsUniqueObjectArray('servicio_id', {
    message: 'Los servicios del autobús deben ser únicos',
  })
  @ArrayMaxSize(15, {
    message: 'El autobús no puede tener más de 15 servicios',
  })
  @ArrayMinSize(1, {
    message: 'El autobús debe tener al menos 1 servicio',
  })
  servicios?: AutobusServicioDto[];
}
