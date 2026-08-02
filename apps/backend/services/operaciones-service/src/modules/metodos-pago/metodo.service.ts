import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { MetodoPago } from "./metodo.entity";

const LIST_CACHE_KEY = "metodos_pago:list";

@Injectable()
export class MetodosPagoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectPinoLogger(MetodosPagoService.name)
    private readonly logger: PinoLogger,
  ) {}

  async findAll() {
    this.logger.debug(
      "Obteniendo todos los métodos de pago",
    );

    // 1) ¿está en caché?
    try {
      const cached =
        await this.redis.get<MetodoPago[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: "caché",
            count: cached.length,
          },
          "Métodos de pago obtenidos desde caché",
        );
        return cached;
      }
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        "Error al obtener métodos de pago desde caché",
      );
    }

    // 2) no está → base de datos
    const metodosPago =
      await this.prisma.metodoPago.findMany({
        orderBy: { createdAt: "desc" },
        include: { compras: true },
      });

    // 3) guarda para la próxima (10 días)
    try {
      await this.redis.set(
        LIST_CACHE_KEY,
        metodosPago,
        86400 * 100,
      ); // 100 días
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        "Error al guardar métodos de pago en caché",
      );
    }

    this.logger.debug(
      {
        source: "database",
        count: metodosPago.length,
      },
      "Métodos de pago obtenidos desde base de datos y guardados en caché",
    );
    return metodosPago;
  }

  async findOne(id: number) {
    this.logger.debug(
      { id },
      "Obteniendo método de pago por ID",
    );

    const metodoPago =
      await this.prisma.metodoPago.findUnique({
        where: { id },
        include: { compras: true },
      });

    if (!metodoPago) {
      this.logger.warn(
        {
          id,
        },
        "Método de pago no encontrado",
      );
      throw new NotFoundException(
        `Método de pago ${id} no existe`,
      );
    }

    this.logger.info(
      {
        id,
        nombre: metodoPago.nombre,
      },
      "Método de pago encontrado",
    );
    return metodoPago;
  }
}
