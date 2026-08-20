import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrivilegiosService } from './privilegios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrivilegesGuard } from '../auth/guards/privileges.guard';
import { Privileges } from '../auth/decorators/privileges.decorator';

@ApiTags('Privilegios')
@ApiBearerAuth()
@Controller('privilegios')
@UseGuards(JwtAuthGuard, PrivilegesGuard)
export class PrivilegiosController {
  constructor(private readonly privileges: PrivilegiosService) {}

  @Get()
  @Privileges('privilegios:consultar')
  list() {
    return this.privileges.list();
  }
}
