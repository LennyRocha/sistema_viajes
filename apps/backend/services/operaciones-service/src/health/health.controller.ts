import { Controller, Get } from '@nestjs/common';

@Controller('operaciones/health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'operaciones-service' };
  }
}
