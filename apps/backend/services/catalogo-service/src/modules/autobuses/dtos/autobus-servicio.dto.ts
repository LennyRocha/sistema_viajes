import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AutobusServicioDto {
  @ApiProperty({
    description: 'ID del servicio',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del servicio es obligatorio' })
  servicio_id!: number;
  @ApiProperty({
    description: 'Configuración del servicio',
    example: {
      asientos: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          x: 1,
          y: 1,
          label: 'A1',
          estado: 'AVAILABLE',
        },
      ],
    },
  })
  @IsNotEmpty({ message: 'La configuración del servicio es obligatoria' })
  @IsObject({
    message: 'La configuración del servicio debe ser un objeto JSON válido',
  })
  config_servicio!: Record<string, any>;
}
