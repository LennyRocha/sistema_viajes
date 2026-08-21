import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { RedisModule } from "src/redis/redis.module";
import { PagosController } from "./pagos.controller";
import { PagosService } from "./pagos.service";
import { ComprasModule } from "../Compras/compras.module";

@Module({
  imports: [PrismaModule, RedisModule, ComprasModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
