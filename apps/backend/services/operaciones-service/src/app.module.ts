import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { HttpExceptionFilter } from "@commons/filters";
import { LoggerModule } from "nestjs-pino";
import { HealthController } from "./health/health.controller";
import { ConfiguracionesModule } from "./modules/configuraciones/configuraciones.module";
import { RutasModule } from "./modules/rutas/rutas.module";
import { ViajesBaseModule } from "./modules/viajes-base/viajes-base.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SalidasModule } from "./modules/salidas/salidas.module";
import { MetodosPagoModule } from "./modules/metodos-pago/metodo.module";
import { ComprasModule } from "./modules/Compras/compras.module";
import { PagosModule } from "./modules/pagos/pagos.module";
import { CompradorModule } from "./modules/comprador/comprador.module";
import { CalendarioViajesModule } from "./modules/calendario-viajes/calendario-viajes.module";
import { AlexaModule } from "./modules/alexa/alexa.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    ConfiguracionesModule,
    RutasModule,
    ViajesBaseModule,
    SalidasModule,
    MetodosPagoModule,
    ComprasModule,
    PagosModule,
    CompradorModule,
    CalendarioViajesModule,
    AlexaModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
