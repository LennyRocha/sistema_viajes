import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsObject,
	IsOptional,
	Min,
} from 'class-validator';

import { TipoSalida } from '../types/tipo-salida';
import { EstadoSalida } from '../types/estado-salida';

export class UpdateSalidaDto {
	@IsOptional()
	@IsInt({
		message: 'El autobús debe ser un número entero',
	})
	@Min(1, {
		message: 'Selecciona un autobús válido',
	})
	autobusId?: number;

	@IsOptional()
	@IsInt({
		message: 'El conductor debe ser un número entero',
	})
	@Min(1, {
		message: 'Selecciona un conductor válido',
	})
	conductorId?: number;

	@IsOptional()
	@IsInt({
		message: 'El viaje base debe ser un número entero',
	})
	@Min(1, {
		message: 'Selecciona un viaje base válido',
	})
	viajeBaseId?: number;

	@IsOptional()
	@IsNotEmpty({
		message: 'La configuración del horario no puede estar vacía',
	})
	@IsObject({
		message: 'La configuración del horario debe ser un objeto',
	})
	horario_configuracion?: Record<string, any>;

	@IsOptional()
	@IsEnum(TipoSalida, {
		message: 'Tipo de salida inválido',
	})
	tipoSalida?: TipoSalida;

	@IsOptional()
	@IsEnum(EstadoSalida, {
		message: 'Estado de salida inválido',
	})
	estadoSalida?: EstadoSalida;

	@IsOptional()
	@IsNotEmpty({
		message: 'La configuración de precios no puede estar vacía',
	})
	@IsObject({
		message: 'Los precios deben ser un objeto',
	})
	precios?: Record<string, any>;
}