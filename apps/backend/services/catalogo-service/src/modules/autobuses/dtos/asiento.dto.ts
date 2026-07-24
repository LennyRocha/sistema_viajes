import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { AsientoEstado } from '../types/AsientoEstado';

export class AsientoDto {
  @IsNotEmpty({ message: 'El ID del asiento es obligatorio' })
  @IsUUID()
  id!: string;
  @IsNotEmpty({ message: 'La posición X del asiento es obligatoria' })
  x!: number;
  @IsNotEmpty({ message: 'La posición Y del asiento es obligatoria' })
  y!: number;
  @IsNotEmpty({ message: 'La etiqueta del asiento es obligatoria' })
  label!: string;
  @IsNotEmpty({ message: 'El estado del asiento es obligatorio' })
  @IsEnum(AsientoEstado, {
    message: `El estado del asiento debe ser uno de los siguientes valores: ${Object.values(
      AsientoEstado,
    ).join(', ')}`,
  })
  estado!: AsientoEstado;
}
