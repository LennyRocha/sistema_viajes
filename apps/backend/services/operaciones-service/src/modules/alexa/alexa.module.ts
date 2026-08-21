import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { RedisModule } from "src/redis/redis.module";
import { ComprasModule } from "../Compras/compras.module";
import { SalidasModule } from "../salidas/salidas.module";
import { AlexaController } from "./alexa.controller";
import { AlexaService } from "./alexa.service";

@Module({
  imports: [PrismaModule, RedisModule, SalidasModule, ComprasModule],
  controllers: [AlexaController],
  providers: [AlexaService],
})
export class AlexaModule {}
