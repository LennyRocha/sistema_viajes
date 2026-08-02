import { Module } from "@nestjs/common";
import { MetodosPagoService } from "./metodo.service";
import { MetodosPagoController } from "./metodo.controller";

@Module({
  controllers: [MetodosPagoController],
  providers: [MetodosPagoService],
  exports: [MetodosPagoService],
})
export class MetodosPagoModule {}
