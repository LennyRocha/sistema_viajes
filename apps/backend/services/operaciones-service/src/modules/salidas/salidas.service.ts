import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';


import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

import { CreateSalidaDto } from './dtos/create-salida.dto';

@Injectable()
export class SalidasService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        @InjectPinoLogger(SalidasService.name)
        private readonly logger: PinoLogger,
    ) { }


    async create(dto: CreateSalidaDto) {
        this.logger.info(
            {
                viajeBaseId: dto.viajeBaseId,
                conductorId: dto.conductorId,
                autobusId: dto.autobusId,
            },
            'Creando salida',
        );

        const catalogoService = process.env.CATALOGO_SERVICE_URL;

        if (!catalogoService) {
            this.logger.error(
                'CATALOGO_SERVICE_URL no está configurada',
            );

            throw new BadRequestException(
                'Error de configuración del servidor',
            );
        }

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
                'Viaje base no encontrado',
            );

            throw new NotFoundException(
                'El viaje base no existe',
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
                'No fue posible comunicarse con catalogo-service',
            );

            throw new BadRequestException(
                'No fue posible validar conductor y autobús',
            );
        }

        if (!conductorResponse.ok) {
            this.logger.warn(
                {
                    conductorId: dto.conductorId,
                },
                'Conductor no encontrado',
            );

            throw new BadRequestException(
                'El conductor seleccionado no existe',
            );
        }

        if (!autobusResponse.ok) {
            this.logger.warn(
                {
                    autobusId: dto.autobusId,
                },
                'Autobús no encontrado',
            );

            throw new BadRequestException(
                'El autobús seleccionado no existe',
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
            await this.redis.del('salidas:list');

            this.logger.debug(
                {
                    key: 'salidas:list',
                },
                'Caché eliminada',
            );
        } catch (error) {
            this.logger.error(
                {
                    err: error,
                },
                'Error al limpiar caché',
            );
        }

        this.logger.info(
            {
                salidaId: salida.id,
            },
            'Salida creada correctamente',
        );

        return salida;
    }


    
}
