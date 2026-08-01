/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

import { ConductoresService } from '../conductores/conductores.service';
import { CACHE_KEY as CONDUCTOR_CACHE_KEY } from '../conductores/conductores.service';

import { CreateLicenciaAloneDto } from './dtos/create-licencia-alone.dto';
import { UpdateLicenciaDto } from './dtos/update-licencia.dto';

const LIST_CACHE_KEY = (conductor_id = 0) =>
  conductor_id === 0
    ? 'licencias:list:all'
    : `licencias:list:conductor:${conductor_id}`;

@Injectable()
export class LicenciasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly conductores: ConductoresService,
    @InjectPinoLogger(LicenciasService.name)
    private readonly logger: PinoLogger,
  ) {}

  /**
   * Normaliza texto: sin espacios sobrantes, capitalizado por palabra.
   * (Duplicado de ConductoresService.normalizeText — candidato a mover
   * a un util compartido, ej. src/common/utils/normalize-text.util.ts)
   */
  private normalizeText(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private async invalidateCaches(conductor_id: number, institucion_id: number) {
    try {
      await Promise.all([
        this.redis.del(LIST_CACHE_KEY()),
        this.redis.del(LIST_CACHE_KEY(conductor_id)),
        this.redis.del(CONDUCTOR_CACHE_KEY()),
        this.redis.del(CONDUCTOR_CACHE_KEY(institucion_id)),
      ]);

      this.logger.debug(
        {
          keys: [
            LIST_CACHE_KEY(),
            LIST_CACHE_KEY(conductor_id),
            CONDUCTOR_CACHE_KEY(),
            CONDUCTOR_CACHE_KEY(institucion_id),
          ],
        },
        'Caché eliminada',
      );
    } catch (error) {
      this.logger.error({ err: error }, 'Error al eliminar caché');
    }
  }

  /**
   * CREATE
   */
  async create(dto: CreateLicenciaAloneDto) {
    this.logger.info(
      { conductor_id: dto.conductor_id, numero_licencia: dto.numero_licencia },
      'Creando licencia',
    );

    // Valida que el conductor exista (404 si no) y obtiene su institucion_id
    const conductor = await this.conductores.findOne(dto.conductor_id);

    const licencia = await this.prisma.$transaction(async (tx) => {
      if (dto.vigente) {
        // Solo puede haber una licencia vigente por conductor
        await tx.licencia.updateMany({
          where: { conductor_id: dto.conductor_id, vigente: true },
          data: { vigente: false },
        });
      }

      return tx.licencia.create({
        data: {
          conductor_id: dto.conductor_id,
          numero_licencia: dto.numero_licencia
            .trim()
            .replace(/\s+/g, '')
            .toUpperCase(),
          categoria: dto.categoria.trim().toUpperCase(),
          fecha_expedicion: dto.fecha_expedicion,
          fecha_vencimiento: dto.fecha_vencimiento,
          estado_emisor: this.normalizeText(dto.estado_emisor),
          imagen_licencia: dto.imagen_licencia.trim(),
          vigente: dto.vigente,
        },
      });
    });

    await this.invalidateCaches(licencia.conductor_id, conductor.institucion_id);

    this.logger.info({ licenciaId: licencia.id }, 'Licencia creada');
    return licencia;
  }

  /**
   * FIND ALL
   */
  async findAll(vigente?: boolean, conductor_id = 0) {
    this.logger.debug('Obteniendo todas las licencias');

    const where: Record<string, unknown> = {};

    if (vigente !== undefined) {
      where.vigente = vigente;
    }

    if (conductor_id !== 0) {
      where.conductor_id = conductor_id;
    }

    const licencias = await this.prisma.licencia.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { conductor: true },
    });

    this.logger.debug({ count: licencias.length }, 'Licencias obtenidas');
    return licencias;
  }

  /**
   * FIND ONE
   */
  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo licencia por ID');

    const licencia = await this.prisma.licencia.findUnique({
      where: { id },
      include: { conductor: true },
    });

    if (!licencia) {
      this.logger.warn({ id }, 'Licencia no encontrada');
      throw new NotFoundException(`Licencia ${id} no existe`);
    }

    this.logger.info(
      { id: licencia.id, numero_licencia: licencia.numero_licencia },
      'Licencia encontrada',
    );
    return licencia;
  }

  /**
   * FIND VIGENTE BY CONDUCTOR
   */
  async findVigenteByConductor(conductor_id: number) {
    this.logger.debug({ conductor_id }, 'Obteniendo licencia vigente del conductor');

    const licencia = await this.prisma.licencia.findFirst({
      where: { conductor_id, vigente: true },
    });

    if (!licencia) {
      this.logger.warn({ conductor_id }, 'El conductor no tiene licencia vigente');
      throw new NotFoundException(
        `El conductor ${conductor_id} no tiene una licencia vigente`,
      );
    }

    return licencia;
  }

  /**
   * UPDATE
   */
  async update(id: number, dto: UpdateLicenciaDto) {
    this.logger.info({ licenciaId: id }, 'Actualizando licencia');

    const existing = await this.findOne(id); // 404 si no existe

    const target_conductor_id = dto.conductor_id ?? existing.conductor_id;

    // Si se reasigna a otro conductor, valida que exista
    const conductor =
      dto.conductor_id && dto.conductor_id !== existing.conductor_id
        ? await this.conductores.findOne(dto.conductor_id)
        : await this.conductores.findOne(existing.conductor_id);

    const licencia = await this.prisma.$transaction(async (tx) => {
      if (dto.vigente) {
        // Desmarca cualquier otra licencia vigente del conductor destino
        await tx.licencia.updateMany({
          where: {
            conductor_id: target_conductor_id,
            vigente: true,
            NOT: { id },
          },
          data: { vigente: false },
        });
      }

      return tx.licencia.update({
        where: { id },
        data: {
          conductor_id: target_conductor_id,
          numero_licencia: dto.numero_licencia
            ? dto.numero_licencia.trim().replace(/\s+/g, '').toUpperCase()
            : existing.numero_licencia,
          categoria: dto.categoria
            ? dto.categoria.trim().toUpperCase()
            : existing.categoria,
          fecha_expedicion: dto.fecha_expedicion ?? existing.fecha_expedicion,
          fecha_vencimiento: dto.fecha_vencimiento ?? existing.fecha_vencimiento,
          estado_emisor: dto.estado_emisor
            ? this.normalizeText(dto.estado_emisor)
            : existing.estado_emisor,
          imagen_licencia: dto.imagen_licencia ?? existing.imagen_licencia,
          vigente: dto.vigente ?? existing.vigente,
        },
      });
    });

    // Invalida caché del conductor origen y, si cambió, del destino también
    await this.invalidateCaches(existing.conductor_id, conductor.institucion_id);
    if (target_conductor_id !== existing.conductor_id) {
      const nuevoConductor = await this.conductores.findOne(target_conductor_id);
      await this.invalidateCaches(target_conductor_id, nuevoConductor.institucion_id);
    }

    this.logger.info({ licenciaId: licencia.id }, 'Licencia actualizada');
    return licencia;
  }

  /**
   * SHUTDOWN (alternar vigencia simple)
   */
  async shutdown(id: number) {
    this.logger.debug({ id }, 'Cambiando vigencia de licencia');

    const existing = await this.findOne(id); // 404 si no existe
    const conductor = await this.conductores.findOne(existing.conductor_id);

    const nuevaVigencia = !existing.vigente;

    if (nuevaVigencia) {
      // Si se activa esta, desactiva cualquier otra vigente del mismo conductor
      await this.prisma.$transaction([
        this.prisma.licencia.updateMany({
          where: {
            conductor_id: existing.conductor_id,
            vigente: true,
            NOT: { id },
          },
          data: { vigente: false },
        }),
        this.prisma.licencia.update({
          where: { id },
          data: { vigente: true },
        }),
      ]);
    } else {
      await this.prisma.licencia.update({
        where: { id },
        data: { vigente: false },
      });
    }

    this.logger.info({ id, newVigencia: nuevaVigencia }, 'Vigencia de licencia cambiada');

    await this.invalidateCaches(existing.conductor_id, conductor.institucion_id);

    return { updated: true };
  }

  /**
   * REMOVE (eliminación permanente)
   */
  async remove(id: number) {
    this.logger.debug({ id }, 'Eliminando licencia permanentemente');

    const existing = await this.findOne(id); // 404 si no existe
    const conductor = await this.conductores.findOne(existing.conductor_id);

    await this.prisma.licencia.delete({ where: { id } });
    this.logger.info({ id }, 'Licencia eliminada permanentemente');

    await this.invalidateCaches(existing.conductor_id, conductor.institucion_id);

    return { deleted: true };
  }
}