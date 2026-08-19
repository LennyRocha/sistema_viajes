import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCompraDto {
  @ApiProperty({ example: 5, description: 'Id de la salida a comprar' })
  @IsInt()
  @IsPositive()
  salidaId!: number;

  @ApiProperty({ example: 12, description: 'Id del comprador' })
  @IsInt()
  @IsPositive()
  compradorId!: number;

  @ApiProperty({ example: 2, description: 'Cantidad de pasajeros' })
  @IsInt()
  @IsPositive()
  pasajeros!: number;

  @ApiProperty({
    example: ['12A', '12B'],
    description: 'Ids de asiento elegidos, deben existir en el layout de la salida',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  asientos!: string[];
}