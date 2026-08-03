/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { IsCURP } from '@commons/decorators';
import { Type } from 'class-transformer';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'El nombre del usuario',
    example: 'José Armando',
  })
  @IsNotEmpty({ message: 'El nombre del usuario es obligatorio' })
  @MaxLength(50, {
    message: 'El nombre del usuario no puede exceder los 50 caracteres',
  })
  nombres!: string;
  @ApiProperty({
    description: 'El apellido paterno del usuario',
    example: 'Trujillo',
  })
  @IsNotEmpty({ message: 'El apellido paterno del usuario es obligatorio' })
  @MaxLength(50, {
    message:
      'El apellido paterno del usuario no puede exceder los 50 caracteres',
  })
  apellido_paterno!: string;
  @ApiProperty({
    description: 'El apellido materno del usuario',
    example: 'Guzmán',
  })
  @IsNotEmpty({ message: 'El apellido materno del usuario es obligatorio' })
  @MaxLength(50, {
    message:
      'El apellido materno del usuario no puede exceder los 50 caracteres',
  })
  apellido_materno!: string;
  @ApiProperty({
    description: 'La CURP del usuario',
    example: 'TRUJ010101HDFGZM09',
  })
  @IsNotEmpty({ message: 'La CURP del usuario es obligatoria' })
  @MaxLength(18, {
    message: 'La CURP del usuario no puede exceder los 18 caracteres',
  })
  @IsCURP({ message: 'La CURP del usuario debe ser válida' })
  curp!: string;
  @ApiProperty({
    description: 'La fecha de nacimiento del usuario',
    example: '2000-01-01',
  })
  @IsNotEmpty({ message: 'La fecha de nacimiento del usuario es obligatoria' })
  @Type(() => Date)
  @IsDate({
    message: 'La fecha de nacimiento del usuario debe ser una fecha válida',
  })
  fecha_nacimiento!: Date;
  @ApiProperty({
    description: 'El teléfono del usuario',
    example: '5555555555',
  })
  @IsNotEmpty({ message: 'El teléfono del usuario es obligatorio' })
  @MaxLength(15, {
    message: 'El teléfono del usuario no puede exceder los 15 caracteres',
  })
  @IsPhoneNumber('MX', {
    message: 'El teléfono del usuario debe ser un número válido',
  })
  telefono!: string;
  @ApiProperty({
    description: 'El correo electrónico del usuario',
    example: 'jose.armando@example.com',
  })
  @IsNotEmpty({ message: 'El correo electrónico del usuario es obligatorio' })
  @MaxLength(150, {
    message:
      'El correo electrónico del usuario no puede exceder los 150 caracteres',
  })
  @IsEmail({}, { message: 'El correo electrónico del usuario debe ser válido' })
  email!: string;
  @ApiProperty({
    description: 'La foto de perfil del usuario (URL o base64)',
    example: 'https://example.com/foto_perfil.jpg',
  })
  @IsNotEmpty({ message: 'La foto de perfil del usuario es obligatoria' })
  @MaxLength(3_000_000, {
    message:
      'La foto de perfil del usuario no puede exceder el tamano permitido',
  })
  foto_perfil!: string;
  @ApiPropertyOptional({
    description: 'La foto de perfil del usuario en base64 (opcional)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  })
  @IsOptional()
  foto_base64?: string;
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
