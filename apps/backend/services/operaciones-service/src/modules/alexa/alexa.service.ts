import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Prisma } from "generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { ComprasService } from "../Compras/compras.service";
import {
  AsientoEstado,
  Pasajero,
} from "../Compras/types/asiento-compra";
import { EstadoCompra } from "../Compras/types/estado-compra";
import { EstadoPago } from "../pagos/types/estado-pago";
import { SalidasService } from "../salidas/salidas.service";
import { EstadoSalida } from "../salidas/types/estado-salida";
import { TipoSalida } from "../salidas/types/tipo-salida";
import { BuscarViajeAlexaDto } from "./dto/buscar-viaje-alexa.dto";
import { ComprarBoletoAlexaDto } from "./dto/comprar-boleto-alexa.dto";
import { RegistrarSalidaAlexaDto } from "./dto/registrar-salida-alexa.dto";

const TOKEN_PREFIX = "alexa:ott:";
const TOKEN_TTL_HOURS = 2;
const TOKEN_TTL_SECONDS = TOKEN_TTL_HOURS * 60 * 60;

type CatalogoBus = {
  id: number;
  alias?: string;
  codigo_interno?: string;
  marca?: string;
  modelo?: string;
};

type CatalogoConductor = {
  id: number;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
};

@Injectable()
export class AlexaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly salidas: SalidasService,
    private readonly compras: ComprasService,
    @InjectPinoLogger(AlexaService.name)
    private readonly logger: PinoLogger,
  ) {}

  async createToken(secret: string) {
    const expectedSecret = process.env.ALEXA_SHARED_SECRET;

    if (!expectedSecret) {
      throw new BadRequestException(
        "ALEXA_SHARED_SECRET no esta configurado en el servidor",
      );
    }

    if (secret !== expectedSecret) {
      throw new UnauthorizedException("Secret de Alexa invalido");
    }

    const token = randomUUID();
    await this.redis.set(
      `${TOKEN_PREFIX}${token}`,
      { issuedAt: new Date().toISOString() },
      TOKEN_TTL_SECONDS,
    );

    return { token, expiresInSeconds: TOKEN_TTL_SECONDS };
  }

  async buscarViajes(
    token: string | undefined,
    query: BuscarViajeAlexaDto,
  ) {
    await this.consumeToken(token);

    const salidas = await this.salidas.findSalidas(
      query.origen,
      query.destino,
      undefined,
      undefined,
      query.fecha,
      undefined,
      1,
    );

    return {
      viajes: salidas.map((salida) => ({
        id: salida.id,
        viajeBaseId: salida.viajeBaseId,
        viajeBaseNombre: salida.viajeBase?.nombre ?? "Viaje sin nombre",
        origen:
          salida.viajeBase?.rutas?.[0]?.nombre ??
          this.getPlaceName(salida.lugarSalida),
        destino:
          this.getLastRouteName(salida.viajeBase?.rutas) ??
          this.getPlaceName(salida.lugarLlegada),
        fecha:
          salida.horario_configuracion?.inicio?.fecha ??
          query.fecha,
        hora:
          salida.horario_configuracion?.inicio?.hora ??
          salida.horaSalida,
        precio: salida.precio,
        asientosDisponibles: salida.asientosDisponibles,
      })),
    };
  }

  async registrarSalida(
    token: string | undefined,
    dto: RegistrarSalidaAlexaDto,
  ) {
    await this.consumeToken(token);

    const viaje = await this.findViajeBaseByName(dto.viajeBaseNombre);
    const autobus = await this.findAutobusByAlias(dto.autobusAlias);
    const conductor = await this.findConductorByName(dto.conductorNombre);
    const durationMin = Math.max(
      0,
      Math.round(
        viaje.duracionTotalMin ?? viaje.duracionCalculadaMin ?? 0,
      ),
    );
    const horarioConfiguracion = this.buildHorarioConfiguracion(
      dto.fechaSalida,
      dto.horaSalida,
      durationMin,
    );

    const salida = await this.prisma.salida.create({
      data: {
        autobusId: autobus.id,
        conductorId: conductor.id,
        viajeBaseId: viaje.id,
        horario_configuracion: horarioConfiguracion,
        tipoSalida: TipoSalida.UNICA,
        estadoSalida: EstadoSalida.PROGRAMADO,
        precios: await this.resolvePricesForViaje(viaje.id),
        capacidadTotal: await this.resolveBusCapacity(autobus.id),
        asientosLayout: await this.resolveBusSeats(autobus.id),
        estatus: false,
      },
    });

    await this.safeClearSalidasCache();

    return {
      id: salida.id,
      folio: `SAL-${salida.id}`,
      viajeBaseNombre: viaje.nombre,
      fechaSalida: dto.fechaSalida,
      horaSalida: dto.horaSalida,
      autobusAlias: autobus.alias ?? dto.autobusAlias,
      conductorNombre: this.composeConductorName(conductor),
    };
  }

  async comprarBoleto(
    token: string | undefined,
    dto: ComprarBoletoAlexaDto,
  ) {
    await this.consumeToken(token);

    const salida = await this.findBestSalida(
      dto.origen,
      dto.destino,
      dto.fecha,
      dto.pasajeros,
    );

    const comprador = await this.findOrCreateComprador(
      dto.nombreComprador,
      dto.telefono,
      dto.email,
    );
    const metodoPago = await this.findMetodoPagoByName(
      dto.metodoPago,
    );
    const asientosDisponibles = (salida.asientos ?? []).filter(
      (asiento: any) => !asiento.ocupado,
    );

    if (asientosDisponibles.length < dto.pasajeros) {
      throw new BadRequestException(
        "No hay suficientes asientos disponibles para esta salida",
      );
    }

    const pasajerosPayload = asientosDisponibles
      .slice(0, dto.pasajeros)
      .map((asiento: any, index: number) =>
        this.buildPassenger(dto.nombreComprador, asiento, index),
      );

    const compra = await this.prisma.compra.create({
      data: {
        salidaId: salida.id,
        compradorId: comprador.id,
        pasajeros: dto.pasajeros,
        asientos: pasajerosPayload as unknown as any,
        monto:
          (this.salidas.getSalidaPrice(salida.precios) ?? 0) *
          dto.pasajeros,
        codigo: this.generateCompraCode(),
        estado: EstadoCompra.PENDIENTE,
        fechaSalida:
          salida.horario_configuracion?.inicio?.fecha ?? dto.fecha,
        horaSalida:
          salida.horario_configuracion?.inicio?.hora ??
          salida.horaSalida ??
          "",
        expiraEn: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const pago = await this.prisma.pago.create({
      data: {
        compraId: compra.id,
        metodoPagoId: metodoPago.id,
        monto: compra.monto,
        estado: EstadoPago.APROBADO,
        referencia: compra.codigo,
      },
    });

    await this.compras.confirmar(compra.id);
    await this.safeClearSalidasCache();

    return {
      compraId: compra.id,
      codigo: compra.codigo,
      pagoId: pago.id,
      metodoPago: metodoPago.nombre,
      salidaId: salida.id,
      viajeBaseNombre: salida.viajeBase?.nombre ?? "Viaje",
      asientos: pasajerosPayload.map((pasajero) => pasajero.asiento.label),
      monto: Number(compra.monto),
    };
  }

  private async consumeToken(token: string | undefined) {
    if (!token) {
      throw new UnauthorizedException("Token de Alexa requerido");
    }

    const key = `${TOKEN_PREFIX}${token}`;
    const payload = await this.redis.get(key);

    if (!payload) {
      throw new UnauthorizedException(
        "Token de Alexa invalido o expirado",
      );
    }

  }

  private normalizeText(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  private getPlaceName(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return "";
    }

    const place = value as Record<string, unknown>;
    return String(place.nombre ?? place.name ?? "");
  }

  private getLastRouteName(
    rutas?: Array<{ nombre?: string | null }>,
  ) {
    if (!rutas?.length) {
      return "";
    }

    return rutas[rutas.length - 1]?.nombre ?? "";
  }

  private async findViajeBaseByName(name: string) {
    const viajes = await this.prisma.viajeBase.findMany({
      where: { estatus: true },
      include: {
        rutas: {
          include: { ruta: true },
          orderBy: { orden: "asc" },
        },
      },
    });

    const normalizedTarget = this.normalizeText(name);
    const match = viajes.find(
      (viaje) =>
        this.normalizeText(viaje.nombre) === normalizedTarget ||
        this.normalizeText(viaje.nombre).includes(normalizedTarget) ||
        normalizedTarget.includes(this.normalizeText(viaje.nombre)),
    );

    if (!match) {
      throw new NotFoundException(
        `No encontre el viaje base "${name}"`,
      );
    }

    return match;
  }

  private async findAutobusByAlias(alias: string) {
    const catalogoService = this.requireCatalogoServiceUrl();
    const response = await fetch(
      `${catalogoService}/autobuses/alias/${encodeURIComponent(alias)}`,
    );

    if (!response.ok) {
      throw new NotFoundException(
        `No encontre el autobus "${alias}"`,
      );
    }

    return (await response.json()) as CatalogoBus;
  }

  private async findConductorByName(name: string) {
    const catalogoService = this.requireCatalogoServiceUrl();
    const response = await fetch(
      `${catalogoService}/conductores?active=true&institucion=0`,
    );

    if (!response.ok) {
      throw new BadRequestException(
        "No fue posible consultar los conductores disponibles",
      );
    }

    const conductores = (await response.json()) as CatalogoConductor[];
    const normalizedTarget = this.normalizeText(name);
    const match = conductores.find((conductor) => {
      const fullName = this.normalizeText(
        this.composeConductorName(conductor),
      );
      const firstName = this.normalizeText(conductor.nombres ?? "");

      return (
        fullName === normalizedTarget ||
        fullName.includes(normalizedTarget) ||
        firstName === normalizedTarget
      );
    });

    if (!match) {
      throw new NotFoundException(
        `No encontre un conductor con el nombre "${name}"`,
      );
    }

    return match;
  }

  private composeConductorName(conductor: CatalogoConductor) {
    return [
      conductor.nombres,
      conductor.apellido_paterno,
      conductor.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  private buildHorarioConfiguracion(
    fecha: string,
    hora: string,
    durationMin: number,
  ) {
    const start = new Date(`${fecha}T${hora}:00`);

    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException(
        "La fecha u hora de salida no son validas",
      );
    }

    const end = new Date(start.getTime());
    end.setMinutes(end.getMinutes() + durationMin);

    return {
      tipo: TipoSalida.UNICA,
      zonaHoraria: "America/Mexico_City",
      duracionMin: durationMin,
      inicio: {
        fecha,
        hora,
        fechaHoraLocal: `${fecha}T${hora}`,
      },
      finCalculado: {
        fecha: this.toDateOnly(end),
        hora: this.toTimeOnly(end),
        fechaHoraLocal: `${this.toDateOnly(end)}T${this.toTimeOnly(end)}`,
      },
    };
  }

  private async resolvePricesForViaje(
    viajeBaseId: number,
  ): Promise<Prisma.InputJsonValue> {
    const latestSalida = await this.prisma.salida.findFirst({
      where: { viajeBaseId },
      orderBy: { createdAt: "desc" },
      select: { precios: true },
    });

    if (latestSalida?.precios) {
      return latestSalida.precios as Prisma.InputJsonValue;
    }

    const viaje = await this.prisma.viajeBase.findUnique({
      where: { id: viajeBaseId },
      include: {
        rutas: {
          include: { ruta: true },
          orderBy: { orden: "asc" },
        },
      },
    });

    return {
      moneda: "MXN",
      rutas: (viaje?.rutas ?? []).map((ruta) => ({
        rutaId: ruta.id,
        orden: ruta.orden,
        nombre: ruta.ruta?.nombre ?? `Ruta ${ruta.orden}`,
        precio: 0,
      })),
    };
  }

  private async resolveBusSeats(autobusId: number) {
    const catalogoService = this.requireCatalogoServiceUrl();
    const response = await fetch(
      `${catalogoService}/autobuses/salidas/${autobusId}`,
    );

    if (!response.ok) {
      throw new BadRequestException(
        "No fue posible obtener la configuracion de asientos del autobus",
      );
    }

    const autobus = (await response.json()) as {
      asientos?: Array<Record<string, any>>;
    };
    return autobus.asientos ?? [];
  }

  private async resolveBusCapacity(autobusId: number) {
    const seats = await this.resolveBusSeats(autobusId);
    if (seats.length <= 0) {
      throw new BadRequestException(
        "El autobus no tiene asientos configurados",
      );
    }
    return seats.length;
  }

  private async findBestSalida(
    origen: string,
    destino: string,
    fecha: string,
    pasajeros: number,
  ) {
    const salidas = await this.salidas.findSalidas(
      origen,
      destino,
      undefined,
      undefined,
      fecha,
      undefined,
      pasajeros,
    );

    const match = salidas.find(
      (salida) =>
        salida.estadoSalida === EstadoSalida.PROGRAMADO &&
        salida.asientosDisponibles >= pasajeros,
    );

    if (!match) {
      throw new NotFoundException(
        "No encontre una salida disponible para esa ruta y fecha",
      );
    }

    return match;
  }

  private async findOrCreateComprador(
    nombreCompleto: string,
    telefono: string,
    email: string,
  ) {
    const existing = await this.prisma.comprador.findFirst({
      where: {
        OR: [{ email }, { telefono }],
      },
    });

    if (existing) {
      return existing;
    }

    const nameParts = nombreCompleto
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const nombres = nameParts.shift() ?? nombreCompleto.trim();
    const apellido_paterno = nameParts.shift() ?? "Alexa";
    const apellido_materno = nameParts.join(" ") || "Skill";

    return this.prisma.comprador.create({
      data: {
        nombres,
        apellido_paterno,
        apellido_materno,
        telefono,
        email,
      },
    });
  }

  private async findMetodoPagoByName(name: string) {
    const metodos = await this.prisma.metodoPago.findMany({
      where: { estatus: true },
      orderBy: { createdAt: "desc" },
    });

    const normalizedTarget = this.normalizeText(name);
    const match = metodos.find((metodo) => {
      const normalizedMethod = this.normalizeText(metodo.nombre);
      return (
        normalizedMethod === normalizedTarget ||
        normalizedMethod.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedMethod)
      );
    });

    if (!match) {
      throw new NotFoundException(
        `No encontre el metodo de pago "${name}"`,
      );
    }

    return match;
  }

  private buildPassenger(
    nombreComprador: string,
    asiento: any,
    index: number,
  ): Pasajero {
    return {
      nombres:
        index === 0 ? nombreComprador : `${nombreComprador} ${index + 1}`,
      apellidos: "Alexa Skill",
      asiento: {
        id: asiento.id,
        x: asiento.x,
        y: asiento.y,
        label: asiento.label,
        estado: AsientoEstado.SOLD,
      },
    };
  }

  private generateCompraCode() {
    return `BC-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  }

  private requireCatalogoServiceUrl() {
    const serviceUrl = process.env.CATALOGO_SERVICE_URL;
    if (!serviceUrl) {
      throw new BadRequestException(
        "CATALOGO_SERVICE_URL no esta configurada",
      );
    }
    return serviceUrl;
  }

  private toDateOnly(value: Date) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  private toTimeOnly(value: Date) {
    return [
      String(value.getHours()).padStart(2, "0"),
      String(value.getMinutes()).padStart(2, "0"),
    ].join(":");
  }

  private async safeClearSalidasCache() {
    try {
      await this.redis.del("salidas:list");
    } catch (error) {
      this.logger.warn({ err: error }, "No fue posible limpiar la cache");
    }
  }
}
