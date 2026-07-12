import { Module } from '@nestjs/common';
import { TiposAutobusService } from './tipo_bus.service';
import { TiposAutobusController } from './tipo_bus.controller';

@Module({
  imports: [],
  controllers: [TiposAutobusController],
  providers: [TiposAutobusService],
})
export class TiposAutobusModule {}
