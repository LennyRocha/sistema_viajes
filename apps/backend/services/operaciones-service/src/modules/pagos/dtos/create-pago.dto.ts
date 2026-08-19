import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreatePagoDto {
  @ApiProperty({ example: 2, description: 'Id del método de pago elegido' })
  @IsInt()
  @IsPositive()
  metodoPagoId!: number;
}