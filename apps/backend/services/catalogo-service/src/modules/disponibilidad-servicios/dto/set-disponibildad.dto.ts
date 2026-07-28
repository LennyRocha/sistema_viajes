import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SetDisponibilidadDto {
  @ApiProperty({ description: 'El tipo de autobús', example: 1 })
  @IsNotEmpty({ message: 'El tipo de autobús es obligatorio' })
  tipoId!: number;
  @ApiProperty({ description: 'La institución', example: 1 })
  @IsNotEmpty({ message: 'La institución es obligatoria' })
  institucionId!: number;
  @ApiProperty({ description: 'El servicio', example: 1 })
  @IsNotEmpty({ message: 'El servicio es obligatorio' })
  servicioId!: number;
}
