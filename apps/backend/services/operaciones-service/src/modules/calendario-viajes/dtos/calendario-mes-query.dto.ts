import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EstadoSalida } from '../../salidas/types/estado-salida';

export class CalendarioMesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  viajeBaseId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  conductorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  autobusId?: number;

  @IsOptional()
  @IsEnum(EstadoSalida)
  estadoSalida?: EstadoSalida;
}
