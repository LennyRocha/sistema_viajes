import { Module } from '@nestjs/common';
import { TiposAutobusService } from './tipo_bus.service';
import { TiposAutobusController } from './tipo_bus.controller';

@Module({
  controllers: [TiposAutobusController],
  providers: [TiposAutobusService],
  exports: [TiposAutobusService],
})
export class TiposAutobusModule {}
