import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { MetodosPagoService } from "./metodo.service";
import { MetodosPagoController } from "./metodo.controller";

@Module({
  imports: [PrismaModule],
  controllers: [MetodosPagoController],
  providers: [MetodosPagoService],
  exports: [MetodosPagoService],
})
export class MetodosPagoModule {}
