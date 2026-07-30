/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { IsCURP } from '@commons/decorators';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({
    description: 'El nombre del usuario',
    example: 'José Armando',
  })
  @IsOptional()
  @MaxLength(50, {
    message: 'El nombre del usuario no puede exceder los 50 caracteres',
  })
  nombres?: string;
  @ApiPropertyOptional({
    description: 'El apellido paterno del usuario',
    example: 'Trujillo',
  })
  @IsOptional()
  @MaxLength(50, {
    message:
      'El apellido paterno del usuario no puede exceder los 50 caracteres',
  })
  apellido_paterno?: string;
  @ApiPropertyOptional({
    description: 'El apellido materno del usuario',
    example: 'Guzmán',
  })
  @IsOptional()
  @MaxLength(50, {
    message:
      'El apellido materno del usuario no puede exceder los 50 caracteres',
  })
  apellido_materno?: string;
  @ApiPropertyOptional({
    description: 'La CURP del usuario',
    example: 'TRUJ010101HDFGZM09',
  })
  @IsOptional()
  @MaxLength(18, {
    message: 'La CURP del usuario no puede exceder los 18 caracteres',
  })
  @IsCURP({ message: 'La CURP del usuario debe ser válida' })
  curp?: string;
  @ApiPropertyOptional({
    description: 'La fecha de nacimiento del usuario',
    example: '2000-01-01',
  })
  @IsOptional()
  @IsDate({
    message: 'La fecha de nacimiento del usuario debe ser una fecha válida',
  })
  fecha_nacimiento?: Date;
  @ApiPropertyOptional({
    description: 'El teléfono del usuario',
    example: '5555555555',
  })
  @IsOptional()
  @MaxLength(15, {
    message: 'El teléfono del usuario no puede exceder los 15 caracteres',
  })
  @IsPhoneNumber('MX', {
    message: 'El teléfono del usuario debe ser un número válido',
  })
  telefono?: string;
  @ApiPropertyOptional({
    description: 'El correo electrónico del usuario',
    example: 'jose.armando@example.com',
  })
  @IsOptional()
  @MaxLength(150, {
    message:
      'El correo electrónico del usuario no puede exceder los 150 caracteres',
  })
  @IsEmail({}, { message: 'El correo electrónico del usuario debe ser válido' })
  email?: string;
  @ApiPropertyOptional({
    description: 'La foto de perfil del usuario (URL o base64)',
    example: 'https://example.com/foto_perfil.jpg',
  })
  @IsOptional()
  @MaxLength(255, {
    message:
      'La foto de perfil del usuario no puede exceder los 255 caracteres',
  })
  @IsUrl(
    {},
    { message: 'La foto de perfil del usuario debe ser una URL válida' },
  )
  foto_perfil?: string;
  @ApiPropertyOptional({
    description: 'La foto de perfil del usuario en base64 (opcional)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  })
  @IsOptional()
  foto_base64?: string;
}
