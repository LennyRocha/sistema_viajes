import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@nexoroute.mx' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MiPasswordSegura1!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
