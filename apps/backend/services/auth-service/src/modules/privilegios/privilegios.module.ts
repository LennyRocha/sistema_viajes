import { Module } from '@nestjs/common';
import { PrivilegiosController } from './privilegios.controller';
import { PrivilegiosService } from './privilegios.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PrivilegiosService],
  controllers: [PrivilegiosController],
  exports: [PrivilegiosService],
})
export class PrivilegiosModule {}
