import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsDecimal,
  IsNotEmpty,
  IsPositive,
  IsString,
} from "class-validator";

export class CreatePagoDto {
  @ApiProperty({
    example: 5,
    description: "Monto del pago",
  })
  @IsDecimal()
  @IsNotEmpty()
  monto!: number;

  @ApiProperty({
    example: 12,
    description: "Id del método de pago",
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  metodoPagoId!: number;

  @ApiProperty({
    example: 12,
    description: "Id de la compra",
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  compraId!: number;

  @ApiProperty({
    example: "BC-57A0DBC7",
    description:
      "Código de la compra que servira como referencia para el pago",
  })
  @IsString()
  @IsNotEmpty()
  referencia!: string;
}
