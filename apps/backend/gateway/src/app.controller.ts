import { Controller, Get } from '@nestjs/common';

type ServiceHealth = {
  name: string;
  target: string;
  status: 'ok' | 'down';
  statusCode?: number;
  error?: string;
};

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
          '/operaciones/health': `${target_two}/operaciones/health`,
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

  @Get('health/services')
  async servicesHealth() {
    const services = await Promise.all([
      this.checkService(
        'auth-service',
        `${process.env.AUTH_SERVICE_URL ?? 'http://localhost:5001'}/health`,
      ),
      this.checkService(
        'catalogo-service',
        `${process.env.CATALOGO_SERVICE_URL ?? 'http://localhost:5002'}/health`,
      ),
      this.checkService(
        'operaciones-service',
        `${process.env.OPERACIONES_SERVICE_URL ?? 'http://localhost:5003'}/operaciones/health`,
      ),
      this.checkService(
        'record-service',
        `${process.env.DASHBOARD_SERVICE_URL ?? 'http://localhost:5004'}/health`,
      ),
    ]);

    return {
      status: services.every((service) => service.status === 'ok')
        ? 'ok'
        : 'degraded',
      service: 'api-gateway',
      services,
    };
  }

  private async checkService(
    name: string,
    target: string,
  ): Promise<ServiceHealth> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(target, { signal: controller.signal });

      return {
        name,
        target,
        status: response.ok ? 'ok' : 'down',
        statusCode: response.status,
      };
    } catch (error) {
      return {
        name,
        target,
        status: 'down',
        error: error instanceof Error ? error.message : 'Servicio no disponible',
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
