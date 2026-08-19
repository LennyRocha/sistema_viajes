import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class CreateCompradorDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MaxLength(100)
  nombres!: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MaxLength(100)
  apellido_paterno!: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  @MaxLength(100)
  apellido_materno!: string;

  @ApiProperty({ example: '7771234567' })
  @IsString()
  @Length(10, 15)
  telefono!: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  @MaxLength(150)
  email!: string;
}