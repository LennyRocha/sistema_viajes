import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword, MaxLength } from 'class-validator';

export class NewPasswordDto {
  @ApiProperty({
    description: 'La contraseña del usuario',
    example: 'MiContraseñaSegura123!',
  })
  @IsNotEmpty({ message: 'La contraseña del usuario es obligatoria' })
  @MaxLength(255, {
    message: 'La contraseña del usuario no puede exceder los 255 caracteres',
  })
  @IsNotEmpty({ message: 'La contraseña del usuario es obligatoria' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña del usuario debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un símbolo',
    },
  )
  contra!: string;
}
