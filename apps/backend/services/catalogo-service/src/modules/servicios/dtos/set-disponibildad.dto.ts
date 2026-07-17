import { IsNotEmpty } from 'class-validator';

export class SetDisponibilidadDto {
  @IsNotEmpty({ message: 'El tipo de autobús es obligatorio' })
  tipoId!: number;
  @IsNotEmpty({ message: 'La institución es obligatoria' })
  institucionId!: number;
  @IsNotEmpty({ message: 'El servicio es obligatorio' })
  servicioId!: number;
}
