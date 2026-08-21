import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const RESULTADOS = ['EXITO', 'FALLO', 'DENEGADO'] as const;
const SEVERIDADES = ['INFO', 'ADVERTENCIA', 'CRITICO'] as const;

export class CreateActividadReporteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  evento!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  categoria!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  accion!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  modulo!: string;

  @IsIn(RESULTADOS)
  resultado!: (typeof RESULTADOS)[number];

  @IsIn(SEVERIDADES)
  severidad!: (typeof SEVERIDADES)[number];

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ip?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  metodo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ruta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  recurso?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  recursoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  mensaje?: string;

  @IsOptional()
  @IsObject()
  detalles?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  requestId?: string;
}
