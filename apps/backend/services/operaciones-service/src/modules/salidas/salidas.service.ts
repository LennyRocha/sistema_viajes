import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { Prisma } from "generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";

import { CreateSalidaDto } from "./dtos/create-salida.dto";
import { UpdateSalidaDto } from "./dtos/update-salida.dto";
import { EstadoSalida } from "./types/estado-salida";
import { AutobusSalidaResponse } from "./types/autobus-salida";
import { PreciosSalida } from "./types/precios-salida";

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

  private normalizeText(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  private getPlaceField(
    place: unknown,
    field: "placeId" | "nombre" | "direccion",
  ) {
    if (
      typeof place !== "object" ||
      place === null ||
      Array.isArray(place)
    ) {
      return "";
    }

    const value = (place as Record<string, unknown>)[field];
    return typeof value === "string" ? value : "";
  }

  private matchesTextFilter(
    candidate: string,
    expected: string,
  ) {
    const normalizedCandidate = this.normalizeText(candidate);
    const normalizedExpected = this.normalizeText(expected);

    if (!normalizedCandidate || !normalizedExpected) {
      return false;
    }

    return (
      normalizedCandidate === normalizedExpected ||
      normalizedCandidate.includes(normalizedExpected) ||
      normalizedExpected.includes(normalizedCandidate)
    );
  }

  private extractSearchTokens(value: string) {
    return this.normalizeText(value)
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);
  }

  private matchesKeywordSearch(
    values: Array<string | null | undefined>,
    expected: string,
  ) {
    const haystack = this.normalizeText(
      values.filter(Boolean).join(" "),
    );

    if (!haystack) {
      return false;
    }

    const tokens = this.extractSearchTokens(expected);
    if (tokens.length === 0) {
      return this.matchesTextFilter(haystack, expected);
    }

    return tokens.every((token) => haystack.includes(token));
  }

  public getSalidaPrice(precios: any): number | null {
    if (!precios || typeof precios !== "object") {
      return null;
    }

    const data = precios as PreciosSalida & {
      moneda?: string;
      rutas?: Array<{ precio?: number | string }>;
    };

    if (Array.isArray(data.rutas)) {
      return data.rutas.reduce((acc, ruta) => {
        const precio = Number(ruta?.precio ?? 0);
        return acc + (Number.isFinite(precio) ? precio : 0);
      }, 0);
    }

    if (Array.isArray(data.preciosRuta)) {
      return data.preciosRuta.reduce((acc, ruta) => {
        const precio = Number(ruta?.precioRuta ?? 0);
        return acc + (Number.isFinite(precio) ? precio : 0);
      }, 0);
    }

    if (data.precioBase !== undefined) {
      const precioBase = Number(data.precioBase);
      return Number.isFinite(precioBase) ? precioBase : null;
    }

    return null;
  }

  public async getAsientosOcupados(
    salidaId: number,
  ): Promise<Set<string>> {
    const compras = await this.prisma.compra.findMany({
      where: {
        salidaId,
        OR: [
          { estado: "CONFIRMADA" },
          {
            estado: "PENDIENTE",
            expiraEn: { gt: new Date() },
          },
        ],
      },
      select: { asientos: true },
    });

    const ocupados = new Set<string>();
    for (const compra of compras) {
      const asientos = compra.asientos as string[] | null;
      (asientos ?? []).forEach((id) => ocupados.add(id));
    }
    return ocupados;
  }

  private async mapSalida(salida: any) {
    const [viaje, asientosOcupados] = await Promise.all([
      this.prisma.viajeBase.findUnique({
        where: { id: salida.viajeBaseId },
        include: {
          rutas: {
            include: { ruta: true },
            orderBy: { orden: "asc" },
          },
        },
      }),
      this.getAsientosOcupados(salida.id),
    ]);

    const catalogoService = this.requireCatalogoService();

    const [busResponse, conductorResponse] = await Promise.all([
      fetch(`${catalogoService}/autobuses/salidas/${salida.autobusId}`),
      fetch(`${catalogoService}/conductores/salidas/${salida.conductorId}`),
    ]);

    const [busData, conductorData] = await Promise.all([
      busResponse.json(),
      conductorResponse.json(),
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

    const layout = (salida.asientosLayout ?? []) as Array<{
      id: string;
      x: number;
      y: number;
      label: string;
      estado: any;
    }>;

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
      institucion: busData?.institucion ?? null,
      amenidades: busData?.servicios ?? null,
      tipoAutobus: busData?.tipoAutobus ?? null,
      conductor: conductorResponse.ok ? conductorData : null,
      capacidadTotal: salida.capacidadTotal,
      asientosDisponibles:
        salida.capacidadTotal - asientosOcupados.size,
      asientos: layout.map((asiento) => ({
        id: asiento.id,
        x: asiento.x,
        y: asiento.y,
        label: asiento.label,
        estado: asiento.estado,
        ocupado: asientosOcupados.has(asiento.id),
      })),
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

    const [, autobusData] = await Promise.all([
      conductorResponse.json(),
      autobusResponse.json() as Promise<AutobusSalidaResponse>,
    ]);

    const asientosLayout = autobusData.asientos ?? [];
    const capacidadTotal = asientosLayout.length;

    if (capacidadTotal <= 0) {
      throw new BadRequestException(
        "El autobus seleccionad no tiene asientos configurados",
      );
    }

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
            capacidadTotal,
            asientosLayout,
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

  async findSalidas(
    from?: string,
    to?: string,
    fromId?: string,
    toId?: string,
    fechaIda?: string,
    fechaVuelta?: string,
    pasajeros: number = 1,
  ) {
    const where: Prisma.SalidaWhereInput = {};

    if (fechaIda) {
      where.horario_configuracion = {
        path: ["inicio", "fecha"],
        equals: fechaIda,
      };
    }

    if (fechaVuelta) {
      where.horario_configuracion = {
        path: ["finCalculado", "fecha"],
        equals: fechaVuelta,
      };
    }

    const salidas = await this.prisma.salida.findMany({
      where,
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

    let list = await Promise.all(
      salidas.map((salida) => this.mapSalida(salida)),
    );

    if (fromId) {
      list = list.filter((salida) => {
        const rutas = salida.viajeBase?.rutas ?? [];
        return rutas.some(
          (ruta) =>
            this.getPlaceField(ruta?.origen, "placeId") ===
            fromId,
        );
      });
    }

    if (toId) {
      list = list.filter((salida) => {
        const rutas = salida.viajeBase?.rutas ?? [];
        return rutas.some(
          (ruta) =>
            this.getPlaceField(ruta?.destino, "placeId") ===
            toId,
        );
      });
    }

    if (from && !fromId) {
      list = list.filter((salida) => {
        const rutas = salida.viajeBase?.rutas ?? [];
        return rutas.some((ruta) =>
          this.matchesKeywordSearch(
            [
              ruta?.nombre ?? "",
              this.getPlaceField(ruta?.origen, "nombre"),
              this.getPlaceField(ruta?.origen, "direccion"),
            ],
            from,
          ),
        );
      });
    }

    if (to && !toId) {
      list = list.filter((salida) => {
        const rutas = salida.viajeBase?.rutas ?? [];
        return rutas.some((ruta) =>
          this.matchesKeywordSearch(
            [
              ruta?.nombre ?? "",
              this.getPlaceField(ruta?.destino, "nombre"),
              this.getPlaceField(ruta?.destino, "direccion"),
            ],
            to,
          ),
        );
      });
    }

    return list;
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

    let capacidadTotal: number | undefined;
    let asientosLayout:
      | AutobusSalidaResponse["asientos"]
      | undefined;

    if (dto.autobusId) {
      const comprasActivas = await this.prisma.compra.count(
        {
          where: {
            salidaId: id,
            OR: [
              { estado: "CONFIRMADA" },
              {
                estado: "PENDIENTE",
                expiraEn: { gt: new Date() },
              },
            ],
          },
        },
      );

      if (comprasActivas > 0) {
        throw new BadRequestException(
          "No se puede reasignar el autobús: la salida ya tiene compras activas",
        );
      }

      const catalogoService = this.requireCatalogoService();
      const response = await fetch(
        `${catalogoService}/autobuses/salidas/${dto.autobusId}`,
      );

      if (!response.ok) {
        throw new BadRequestException(
          "El autobús seleccionado no existe",
        );
      }

      const autobusData =
        (await response.json()) as AutobusSalidaResponse;
      asientosLayout = autobusData.asientos ?? [];
      capacidadTotal = asientosLayout.length;

      if (capacidadTotal <= 0) {
        throw new BadRequestException(
          "El autobús seleccionado no tiene asientos configurados",
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
        ...(capacidadTotal !== undefined
          ? { capacidadTotal }
          : {}),
        ...(asientosLayout !== undefined
          ? {
              asientosLayout:
                asientosLayout as unknown as Prisma.InputJsonValue,
            }
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
