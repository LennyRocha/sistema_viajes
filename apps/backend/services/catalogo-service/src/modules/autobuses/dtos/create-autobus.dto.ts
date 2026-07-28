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
import { ApiProperty } from '@nestjs/swagger';

export class CreateAutobusDto {
  @ApiProperty({
    description: 'Código interno del autobús',
    example: 'BUS-001',
  })
  @IsNotEmpty({ message: 'El código interno del autobús es obligatorio' })
  @MaxLength(10, {
    message: 'El código interno no puede exceder los 10 caracteres',
  })
  codigo_interno!: string;
  @ApiProperty({
    description: 'Marca del autobús',
    example: 'Mercedes-Benz',
  })
  @IsNotEmpty({ message: 'La marca del autobús es obligatoria' })
  @MaxLength(50, {
    message: 'La marca no puede exceder los 50 caracteres',
  })
  marca!: string;
  @ApiProperty({
    description: 'Alias del autobús',
    example: 'Autobús Ejecutivo',
  })
  @IsNotEmpty({ message: 'El alias del autobús es obligatorio' })
  @MaxLength(25, {
    message: 'El alias no puede exceder los 25 caracteres',
  })
  alias!: string;
  @ApiProperty({
    description: 'Modelo del autobús',
    example: 'Sprinter 515 CDI',
  })
  @IsNotEmpty({ message: 'El modelo del autobús es obligatorio' })
  @MaxLength(50, {
    message: 'El modelo no puede exceder los 50 caracteres',
  })
  modelo!: string;
  @ApiProperty({
    description: 'Año del autobús',
    example: 2020,
  })
  @IsNotEmpty({ message: 'El año del autobús es obligatorio' })
  @Min(1950, { message: 'El año del autobús debe ser mayor o igual a 1950' })
  @Max(new Date().getFullYear(), {
    message: `El año del autobús debe ser menor o igual a ${new Date().getFullYear()}`,
  })
  ano!: number;
  @ApiProperty({
    description: 'Capacidad del autobús',
    example: 40,
  })
  @IsNotEmpty({ message: 'La capacidad del autobús es obligatoria' })
  @Min(1, { message: 'La capacidad del autobús debe ser mayor o igual a 1' })
  @Max(44, {
    message: 'La capacidad del autobús debe ser menor o igual a 44',
  })
  capacidad!: number;
  @ApiProperty({
    description: 'Estado del autobús',
    example: Estado.DISPONIBLE,
  })
  @IsNotEmpty({ message: 'El estado del autobús es obligatorio' })
  @IsEnum(Estado, {
    message: `El estado del autobús debe ser uno de los siguientes valores: ${Object.values(
      Estado,
    ).join(', ')}`,
  })
  estado!: Estado;
  @ApiProperty({
    description: 'Color del autobús',
    example: 'Rojo',
  })
  @IsNotEmpty({ message: 'El color del autobús es obligatorio' })
  color!: string;
  @ApiProperty({
    description: 'Descripción del autobús',
    example: 'Autobús de lujo con asientos reclinables y aire acondicionado',
  })
  @IsNotEmpty({ message: 'La descripción del autobús es obligatoria' })
  @MaxLength(255, {
    message: 'La descripción no puede exceder los 255 caracteres',
  })
  descripcion!: string;
  @ApiProperty({
    description: 'ID de la institución a la que pertenece el autobús',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la institución es obligatorio' })
  institucion_id!: number;
  @ApiProperty({
    description: 'ID del tipo de autobús',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del tipo de autobús es obligatorio' })
  tipo_autobus_id!: number;
  @ApiProperty({
    description: 'Asientos del autobús',
    type: [AsientoDto],
  })
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
  @ApiProperty({
    description: 'Servicios del autobús',
    type: [AutobusServicioDto],
  })
  @IsNotEmpty({ message: 'Los servicios del autobús son obligatorios' })
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
  servicios!: AutobusServicioDto[];
}
