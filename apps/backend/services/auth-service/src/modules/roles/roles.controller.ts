import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrivilegesGuard } from '../auth/guards/privileges.guard';
import { Privileges } from '../auth/decorators/privileges.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, PrivilegesGuard)
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @Privileges('roles:consultar')
  list() {
    return this.roles.list();
  }
}
