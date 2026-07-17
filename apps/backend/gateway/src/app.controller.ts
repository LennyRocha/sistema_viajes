import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    const target_one =
      process.env.CATALOGO_SERVICE_URL ?? 'http://localhost:5002';
    const target_two =
      process.env.OPERACIONES_SERVICE_URL ?? 'http://localhost:5003';
    const target_three =
      process.env.DASHBOARD_SERVICE_URL ?? 'http://localhost:5004';
    const target_four = process.env.AUTH_SERVICE_URL ?? 'http://localhost:5001';
    return {
      service: 'api-gateway',
      description:
        'Punto unico de entrada. Reenvia el trafico a los microservicios.',
      servicios: {
        catalogo: {
          '/catalogo': `${target_one}/catalogo (catalogo-service)`,
          '/docs': `${target_one}/docs (Scalar del catalogo-service)`,
          '/api-json': `${target_one}/api-json (OpenAPI del catalogo-service)`,
          '/health': 'estado del propio gateway',
        },
        operaciones: {
          '/operaciones': `${target_two}/operaciones (operaciones-service)`,
          '/docs': `${target_two}/docs (Scalar del operaciones-service)`,
          '/api-json': `${target_two}/api-json (OpenAPI del operaciones-service)`,
          '/health': 'estado del propio gateway',
        },
        dashboard: {
          '/dashboard': `${target_three}/dashboard (dashboard-service)`,
          '/docs': `${target_three}/docs (Scalar del dashboard-service)`,
          '/api-json': `${target_three}/api-json (OpenAPI del dashboard-service)`,
          '/health': 'estado del propio gateway',
        },
        auth: {
          '/auth': `${target_four}/auth (auth-service)`,
          '/docs': `${target_four}/docs (Scalar del auth-service)`,
          '/api-json': `${target_four}/api-json (OpenAPI del auth-service)`,
          '/health': 'estado del propio gateway',
        },
      },
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'api-gateway' };
  }
}
