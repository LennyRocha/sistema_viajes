import { Module } from '@nestjs/common';
import { InstitucionesController } from './usuarios.controller';
import { InstitucionesService } from './usuarios.service';

@Module({
  providers: [InstitucionesService],
  controllers: [InstitucionesController],
  exports: [InstitucionesService],
})
export class UsuariosModule {}
