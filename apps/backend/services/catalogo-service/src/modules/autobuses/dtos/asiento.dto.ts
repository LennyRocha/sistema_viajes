import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { AsientoEstado } from '../types/AsientoEstado';
import { ApiProperty } from '@nestjs/swagger';

export class AsientoDto {
  @IsNotEmpty({ message: 'El ID del asiento es obligatorio' })
  @IsUUID()
  @ApiProperty({
    description: 'ID del asiento',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;
  @ApiProperty({
    description: 'Posición X del asiento',
    example: 1,
  })
  @IsNotEmpty({ message: 'La posición X del asiento es obligatoria' })
  x!: number;
  @ApiProperty({
    description: 'Posición Y del asiento',
    example: 1,
  })
  @IsNotEmpty({ message: 'La posición Y del asiento es obligatoria' })
  y!: number;
  @ApiProperty({
    description: 'Etiqueta del asiento',
    example: 'A1',
  })
  @IsNotEmpty({ message: 'La etiqueta del asiento es obligatoria' })
  label!: string;
  @ApiProperty({
    description: 'Estado del asiento',
    example: AsientoEstado.AVAILABLE,
    enum: AsientoEstado,
  })
  @IsNotEmpty({ message: 'El estado del asiento es obligatorio' })
  @IsEnum(AsientoEstado, {
    message: `El estado del asiento debe ser uno de los siguientes valores: ${Object.values(
      AsientoEstado,
    ).join(', ')}`,
  })
  estado!: AsientoEstado;
}
