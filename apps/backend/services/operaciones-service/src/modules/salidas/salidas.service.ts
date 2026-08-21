import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";

import { CreateSalidaDto } from "./dtos/create-salida.dto";
import { UpdateSalidaDto } from "./dtos/update-salida.dto";
import { EstadoSalida } from "./types/estado-salida";

@Injectable()
export class SalidasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectPinoLogger(SalidasService.name)
    private readonly logger: PinoLogger,
  ) {}

  private requireCatalogoService() {
    const catalogoService =
      process.env.CATALOGO_SERVICE_URL;

    if (!catalogoService) {
      this.logger.error(
        "CATALOGO_SERVICE_URL no está configurada",
      );
      throw new BadRequestException(
        "Error de configuración del servidor",
      );
    }

    return catalogoService;
  }

  private async getAutobusSalidaData(autobusId: number) {
    const catalogoService = this.requireCatalogoService();

    try {
      const response = await fetch(
        `${catalogoService}/autobuses/${autobusId}`,
      );

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as {
        id: number;
        alias?: string;
        marca?: string;
        modelo?: string;
        codigo_interno?: string;
        institucion?: {
          id?: number | null;
          imagen_url?: string | null;
          nombre?: string;
        } | null;
        asientos?: Array<{
          id: string;
          x: number;
          y: number;
          label: string;
          estado: any;
        }>;
        servicios?: Array<{
          id?: number;
          activo?: boolean;
          config_servicio?: Record<string, any>;
          servicio?: {
            id?: number;
            nombre?: string;
            descripcion?: string | null;
            icono_nombre?: string;
          } | null;
        }>;
        tipoAutobus?: {
          id: number;
          nombre: string;
          descripcion: string;
          linea: string;
          capacidad: number;
        };
      };
    } catch (error) {
      this.logger.warn(
        { autobusId, err: error },
        "No fue posible obtener el detalle del autobús para la salida",
      );
      return null;
    }
  }

  private getSalidaPrice(precios: unknown) {
    if (!precios || typeof precios !== "object") {
      return null;
    }

    const priceObject = precios as Record<string, any>;

    if (Array.isArray(priceObject.rutas)) {
      return priceObject.rutas.reduce(
        (
          total: number,
          ruta: { precio?: number | string },
        ) => total + Number(ruta.precio || 0),
        0,
      );
    }

    return priceObject.precio ?? priceObject.total ?? null;
  }

  private async mapSalida(salida: any) {
    const [autobus, viaje] = await Promise.all([
      this.getAutobusSalidaData(salida.autobusId),
      this.prisma.viajeBase.findUnique({
        where: { id: salida.viajeBaseId },
        include: {
          rutas: {
            include: {
              ruta: true,
            },
            orderBy: {
              orden: "asc",
            },
          },
        },
      }),
    ]);

    const orderedRoutes = [...(viaje?.rutas ?? [])].sort(
      (a, b) => a.orden - b.orden,
    );
    const firstRoute = orderedRoutes[0]?.ruta;
    const lastRoute =
      orderedRoutes[orderedRoutes.length - 1]?.ruta;

    const horario =
      typeof salida.horario_configuracion === "object" &&
      salida.horario_configuracion !== null
        ? (salida.horario_configuracion as Record<
            string,
            any
          >)
        : {};

    return {
      id: salida.id,
      autobusId: salida.autobusId,
      conductorId: salida.conductorId,
      viajeBaseId: salida.viajeBaseId,
      tipoSalida: salida.tipoSalida,
      estadoSalida: salida.estadoSalida,
      estatus: salida.estatus,
      horario_configuracion: horario,
      horaSalida:
        horario.hora ?? horario.fechaHoraLocal ?? null,
      lugarSalida: firstRoute?.origen ?? null,
      lugarLlegada: lastRoute?.destino ?? null,
      precio: this.getSalidaPrice(salida.precios),
      precios: salida.precios,
      autobus: autobus
        ? {
            id: autobus.id,
            alias: autobus.alias,
            marca: autobus.marca,
            modelo: autobus.modelo,
            codigo_interno: autobus.codigo_interno,
            institucion: autobus.institucion
              ? {
                  id: autobus.institucion.id ?? null,
                  nombre:
                    autobus.institucion.nombre ?? null,
                  imagen_url:
                    autobus.institucion.imagen_url ?? null,
                }
              : null,
            asientos: (autobus.asientos ?? []).map(
              (asiento) => ({
                id: asiento.id,
                x: asiento.x,
                y: asiento.y,
                label: asiento.label,
                estado: asiento.estado,
              }),
            ),
            servicios: (autobus.servicios ?? []).map(
              (servicio) => ({
                id:
                  servicio?.servicio?.id ??
                  servicio?.id ??
                  null,
                nombre: servicio?.servicio?.nombre ?? null,
                descripcion:
                  servicio?.servicio?.descripcion ?? null,
                icono_nombre:
                  servicio?.servicio?.icono_nombre ?? null,
                activo: servicio?.activo ?? true,
                config_servicio:
                  servicio?.config_servicio ?? null,
              }),
            ),
            tipoAutobus: autobus.tipoAutobus,
          }
        : null,
      viajeBase: viaje
        ? {
            id: viaje.id,
            nombre: viaje.nombre,
            descripcion: viaje.descripcion,
            estatus: viaje.estatus,
            config_rutas: viaje.config_rutas,
            rutas: orderedRoutes.map((ruta) => ({
              id: ruta.id,
              orden: ruta.orden,
              rutaId: ruta.rutaId,
              nombre: ruta.ruta?.nombre ?? null,
              origen: ruta.ruta?.origen ?? null,
              destino: ruta.ruta?.destino ?? null,
            })),
          }
        : null,
      createdAt: salida.createdAt,
      updatedAt: salida.updatedAt,
    };
  }

  async create(dto: CreateSalidaDto) {
    this.logger.info(
      {
        viajeBaseId: dto.viajeBaseId,
        conductorId: dto.conductorId,
        autobusId: dto.autobusId,
      },
      "Creando salida",
    );

    const catalogoService = this.requireCatalogoService();

    const viaje = await this.prisma.viajeBase.findUnique({
      where: {
        id: dto.viajeBaseId,
      },
    });

    if (!viaje) {
      this.logger.warn(
        {
          viajeBaseId: dto.viajeBaseId,
        },
        "Viaje base no encontrado",
      );

      throw new NotFoundException(
        "El viaje base no existe",
      );
    }

    let conductorResponse: Response;
    let autobusResponse: Response;

    try {
      [conductorResponse, autobusResponse] =
        await Promise.all([
          fetch(
            `${catalogoService}/conductores/salidas/${dto.conductorId}`,
          ),
          fetch(
            `${catalogoService}/autobuses/salidas/${dto.autobusId}`,
          ),
        ]);
    } catch (error) {
      this.logger.error(
        {
          err: error,
        },
        "No fue posible comunicarse con catalogo-service",
      );

      throw new BadRequestException(
        "No fue posible validar conductor y autobús",
      );
    }

    if (!conductorResponse.ok) {
      this.logger.warn(
        {
          conductorId: dto.conductorId,
        },
        "Conductor no encontrado",
      );

      throw new BadRequestException(
        "El conductor seleccionado no existe",
      );
    }

    if (!autobusResponse.ok) {
      this.logger.warn(
        {
          autobusId: dto.autobusId,
        },
        "Autobús no encontrado",
      );

      throw new BadRequestException(
        "El autobús seleccionado no existe",
      );
    }

    await Promise.all([
      conductorResponse.json(),
      autobusResponse.json(),
    ]);

    const salida = await this.prisma.$transaction(
      async (tx) => {
        return tx.salida.create({
          data: {
            autobusId: dto.autobusId,
            conductorId: dto.conductorId,
            viajeBaseId: dto.viajeBaseId,
            horario_configuracion:
              dto.horario_configuracion,
            tipoSalida: dto.tipoSalida,
            estadoSalida: dto.estadoSalida,
            precios: dto.precios,
            estatus: false,
          },
        });
      },
    );

    try {
      await this.redis.del("salidas:list");
      this.logger.debug(
        { key: "salidas:list" },
        "Caché eliminada",
      );
    } catch (error) {
      this.logger.error(
        { err: error },
        "Error al limpiar caché",
      );
    }

    this.logger.info(
      { salidaId: salida.id },
      "Salida creada correctamente",
    );

    return salida;
  }

  async findAll(conductorId = 0) {
    const salidas = await this.prisma.salida.findMany({
      where: conductorId ? { conductorId } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        viaje: {
          include: {
            rutas: {
              include: {
                ruta: true,
              },
            },
          },
        },
      },
    });

    return Promise.all(
      salidas.map((salida) => this.mapSalida(salida)),
    );
  }

  async findOne(id: number, conductorId = 0) {
    const salida = await this.prisma.salida.findUnique({
      where: { id, ...(conductorId ? { conductorId } : {}) },
      include: {
        viaje: {
          include: {
            rutas: {
              include: {
                ruta: true,
              },
            },
          },
        },
      },
    });

    if (!salida) {
      throw new NotFoundException(`Salida ${id} no existe`);
    }

    return this.mapSalida(salida);
  }

  async update(id: number, dto: UpdateSalidaDto) {
    const salida = await this.prisma.salida.findUnique({
      where: { id },
    });

    if (!salida) {
      throw new NotFoundException(`Salida ${id} no existe`);
    }

    if (dto.autobusId) {
      const catalogoService = this.requireCatalogoService();
      const response = await fetch(
        `${catalogoService}/autobuses/salidas/${dto.autobusId}`,
      );

      if (!response.ok) {
        throw new BadRequestException(
          "El autobús seleccionado no existe",
        );
      }
    }

    if (dto.conductorId) {
      const catalogoService = this.requireCatalogoService();
      const response = await fetch(
        `${catalogoService}/conductores/salidas/${dto.conductorId}`,
      );

      if (!response.ok) {
        throw new BadRequestException(
          "El conductor seleccionado no existe",
        );
      }
    }

    const updated = await this.prisma.salida.update({
      where: { id },
      data: {
        ...(dto.autobusId !== undefined
          ? { autobusId: dto.autobusId }
          : {}),
        ...(dto.conductorId !== undefined
          ? { conductorId: dto.conductorId }
          : {}),
        ...(dto.viajeBaseId !== undefined
          ? { viajeBaseId: dto.viajeBaseId }
          : {}),
        ...(dto.horario_configuracion !== undefined
          ? {
              horario_configuracion:
                dto.horario_configuracion,
            }
          : {}),
        ...(dto.tipoSalida !== undefined
          ? { tipoSalida: dto.tipoSalida }
          : {}),
        ...(dto.estadoSalida !== undefined
          ? { estadoSalida: dto.estadoSalida }
          : {}),
        ...(dto.precios !== undefined
          ? { precios: dto.precios }
          : {}),
      },
    });

    try {
      await this.redis.del("salidas:list");
    } catch (error) {
      this.logger.error(
        { err: error },
        "Error al limpiar caché",
      );
    }

    return updated;
  }

  async cancel(id: number) {
    const salida = await this.prisma.salida.findUnique({
      where: { id },
    });

    if (!salida) {
      throw new NotFoundException(`Salida ${id} no existe`);
    }

    const updated = await this.prisma.salida.update({
      where: { id },
      data: {
        estadoSalida: EstadoSalida.CANCELADO,
        estatus: false,
      },
    });

    try {
      await this.redis.del("salidas:list");
    } catch (error) {
      this.logger.error(
        { err: error },
        "Error al limpiar caché",
      );
    }

    return updated;
  }
}
