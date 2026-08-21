import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';

type GatewayClaims = {
  sub?: string;
  email?: string;
  roles?: string[];
  privileges?: string[];
};

type ReportActivity = {
  evento: string;
  categoria: string;
  accion: string;
  modulo: string;
  resultado: 'EXITO' | 'FALLO' | 'DENEGADO';
  severidad: 'INFO' | 'ADVERTENCIA' | 'CRITICO';
  usuarioId?: number;
  email?: string;
  roles?: string[];
  ip?: string;
  userAgent?: string;
  metodo?: string;
  ruta?: string;
  recurso?: string;
  recursoId?: string;
  mensaje?: string;
  detalles?: Record<string, unknown>;
  requestId?: string;
};

async function bootstrap() {
  // bodyParser: false → el gateway no lee el body; lo deja pasar intacto al micro.
  // Si Nest parsea el body, los POST/PATCH proxiados se cuelgan.
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const port = process.env.PORT ?? 5000;
  const target_one =
    process.env.CATALOGO_SERVICE_URL ?? 'http://localhost:5002';
  const target_two =
    process.env.OPERACIONES_SERVICE_URL ?? 'http://localhost:5003';
  const target_three =
    process.env.DASHBOARD_SERVICE_URL ?? 'http://localhost:5004';
  const target_four = process.env.AUTH_SERVICE_URL ?? 'http://localhost:5001';
  const internalServiceToken = process.env.INTERNAL_SERVICE_TOKEN;

  const recordActivity = (activity: ReportActivity) => {
    if (!internalServiceToken) return;
    void fetch(`${target_three}/internal/reportes/actividad`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-service-token': internalServiceToken,
      },
      body: JSON.stringify(activity),
    }).catch(() => undefined);
  };

  const requestMetadata = (request: any) => {
    const forwardedFor = request.headers['x-forwarded-for'];
    const requestId = request.headers['x-request-id'];
    return {
      ip:
        (Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor?.split(',')[0]
        )?.trim() ?? request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
      metodo: request.method as string,
      ruta: request.originalUrl as string,
      requestId: Array.isArray(requestId) ? requestId[0] : requestId,
    };
  };

  // El navegador habla con el gateway, no con el micro.
  app.enableCors({ origin: '*' });

  const publicPrefixes = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/jwks.json',
    '/health',
    '/operaciones/health',
    '/docs',
    '/api-json',
    '/instituciones/public',
  ];
  const publicReadPrefixes = [
    '/rutas',
    '/tipos-autobus',
    '/servicios',
    '/salidas/buscar',
  ];
  const isPublicPurchaseRequest = (pathname: string, method: string) => {
    if (method === 'GET') {
      return (
        /^\/salidas\/\d+$/.test(pathname) ||
        /^\/compras\/asientos\/\d+$/.test(pathname) ||
        /^\/compras\/codigo\/[^/]+$/.test(pathname)
      );
    }

    return (
      method === 'POST' &&
      ['/compradores', '/compras', '/pagos'].includes(pathname)
    );
  };
  const privilegeForRequest = (pathname: string, method: string): string[] => {
    if (pathname.startsWith('/usuarios')) {
      if (method === 'GET') return ['usuarios:consultar'];
      if (method === 'POST') return ['usuarios:crear'];
      if (pathname.includes('/status/')) return ['usuarios:estado'];
      if (method === 'PATCH') return ['usuarios:editar'];
      if (method === 'DELETE') return ['usuarios:eliminar'];
    }
    if (pathname.startsWith('/rutas')) {
      if (method === 'GET') return ['ruta:consultar'];
      if (method === 'POST') return ['ruta:crear'];
      if (method === 'PATCH') return ['ruta:editar'];
      if (method === 'DELETE') return ['ruta:eliminar'];
    }
    if (pathname.startsWith('/viajes-base')) {
      if (method === 'GET') return ['viaje-base:consultar'];
      if (method === 'POST') return ['viaje-base:crear'];
      if (method === 'PATCH') return ['viaje-base:editar'];
      if (method === 'DELETE') return ['viaje-base:eliminar'];
    }
    if (pathname.startsWith('/salidas')) {
      if (method === 'GET')
        return ['salida:consultar', 'salida:consultar-propias'];
      if (method === 'POST') return ['viaje:abrir'];
      if (method === 'PATCH' && pathname.endsWith('/cancelar'))
        return ['salida:cancelar'];
      if (method === 'PATCH') return ['salida:reasignar'];
    }
    if (pathname.startsWith('/calendario-viajes'))
      return ['calendario:consultar'];
    if (pathname.startsWith('/autobuses')) {
      if (method === 'GET') return ['autobus:consultar'];
      if (method === 'POST') return ['autobus:crear'];
      if (method === 'PATCH') return ['autobus:editar'];
      if (method === 'DELETE') return ['autobus:eliminar'];
    }
    if (pathname.startsWith('/conductores')) {
      if (method === 'GET') return ['conductores:consultar'];
      if (method === 'POST') return ['conductores:crear'];
      if (method === 'PATCH') return ['conductores:editar'];
      if (method === 'DELETE') return ['conductores:eliminar'];
    }
    if (pathname.startsWith('/servicios')) {
      if (method === 'GET') return ['servicio:consultar'];
      if (method === 'POST') return ['servicio:crear'];
      if (method === 'PATCH') return ['servicio:editar'];
      if (method === 'DELETE') return ['servicio:eliminar'];
    }
    if (
      pathname.startsWith('/instituciones') ||
      pathname.startsWith('/tipos-autobus') ||
      pathname.startsWith('/disponibilidad-servicios') ||
      pathname.startsWith('/licencias')
    ) {
      return method === 'GET'
        ? ['catalogo:consultar']
        : ['catalogo:administrar'];
    }
    if (pathname.startsWith('/roles')) return ['roles:consultar'];
    if (pathname.startsWith('/privilegios')) return ['privilegios:consultar'];
    if (pathname.startsWith('/configuraciones-operaciones')) {
      return method === 'GET'
        ? ['configuracion:consultar']
        : ['configuracion:administrar'];
    }
    if (pathname.startsWith('/reportes')) return ['bitacora:consultar'];
    if (pathname.startsWith('/dashboard')) {
      return ['calendario:consultar', 'calendario:consultar-propio'];
    }
    return [];
  };

  app.use(async (request: any, response: any, next: any) => {
    const pathname = request.path as string;
    const isPublicPrefix = publicPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    const isPublicCatalogRead =
      request.method === 'GET' &&
      publicReadPrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );
    if (
      isPublicPrefix ||
      isPublicCatalogRead ||
      isPublicPurchaseRequest(pathname, request.method)
    ) {
      next();
      return;
    }
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      recordActivity({
        ...requestMetadata(request),
        evento: 'ACCESO_SIN_TOKEN',
        categoria: 'SEGURIDAD',
        accion: 'Acceder a recurso protegido',
        modulo: pathname.split('/').filter(Boolean)[0] ?? 'Gateway',
        resultado: 'DENEGADO',
        severidad: 'ADVERTENCIA',
        mensaje: 'La solicitud no incluyo un Bearer token',
      });
      response
        .status(401)
        .json({ statusCode: 401, message: 'Bearer token requerido' });
      return;
    }
    try {
      const introspection = await fetch(`${target_four}/auth/introspect`, {
        headers: { authorization },
      });
      if (!introspection.ok) {
        recordActivity({
          ...requestMetadata(request),
          evento: 'TOKEN_INVALIDO',
          categoria: 'SEGURIDAD',
          accion: 'Validar sesion',
          modulo: 'Gateway',
          resultado: 'DENEGADO',
          severidad: 'ADVERTENCIA',
          mensaje: 'El access token fue rechazado',
        });
        response
          .status(401)
          .json({ statusCode: 401, message: 'Access token invalido' });
        return;
      }
      const claims = (await introspection.json()) as GatewayClaims;
      const required = privilegeForRequest(pathname, request.method);
      const isAdmin = claims.roles?.includes('ROLE_ADMIN');
      const hasPrivilege = required.some((privilege) =>
        claims.privileges?.includes(privilege),
      );
      if (required.length > 0 && !isAdmin && !hasPrivilege) {
        recordActivity({
          ...requestMetadata(request),
          evento: 'PRIVILEGIO_INSUFICIENTE',
          categoria: 'SEGURIDAD',
          accion: 'Acceder a recurso protegido',
          modulo: pathname.split('/').filter(Boolean)[0] ?? 'Gateway',
          resultado: 'DENEGADO',
          severidad: 'ADVERTENCIA',
          usuarioId: claims.sub ? Number(claims.sub) : undefined,
          email: claims.email,
          roles: claims.roles,
          mensaje: 'El usuario no cuenta con el privilegio requerido',
          detalles: { privilegiosRequeridos: required },
        });
        response.status(403).json({
          statusCode: 403,
          message: 'Privilegio insuficiente',
          required,
        });
        return;
      }

      const canReadAllSalidas = claims.privileges?.includes('salida:consultar');
      const canReadOwnSalidas = claims.privileges?.includes(
        'salida:consultar-propias',
      );
      if (
        !isAdmin &&
        !canReadAllSalidas &&
        canReadOwnSalidas &&
        request.method === 'GET' &&
        pathname.startsWith('/salidas')
      ) {
        if (!claims.sub) {
          response.status(401).json({
            statusCode: 401,
            message: 'El token no identifica al usuario',
          });
          return;
        }
        const conductorResponse = await fetch(
          `${target_one}/conductores/usuario/${claims.sub}`,
        );
        if (!conductorResponse.ok) {
          const isSalidasCollection =
            pathname === '/salidas' || pathname === '/salidas/';
          if (conductorResponse.status === 404 && isSalidasCollection) {
            response.status(200).json([]);
            return;
          }
          response.status(conductorResponse.status === 404 ? 404 : 503).json({
            statusCode: conductorResponse.status === 404 ? 404 : 503,
            message:
              conductorResponse.status === 404
                ? 'El perfil de conductor aun no ha sido completado'
                : 'Catalogo service no disponible',
          });
          return;
        }
        const conductor = (await conductorResponse.json()) as { id: number };
        const requestUrl = new URL(request.originalUrl, 'http://localhost');
        requestUrl.searchParams.set('conductorId', String(conductor.id));
        request.url = `${requestUrl.pathname}${requestUrl.search}`;
      }

      if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
        const startedAt = Date.now();
        const pathParts = pathname.split('/').filter(Boolean);
        response.once('finish', () => {
          const successful = response.statusCode < 400;
          recordActivity({
            ...requestMetadata(request),
            evento: `OPERACION_${request.method}`,
            categoria: 'OPERACION',
            accion: `${request.method} ${pathname}`.slice(0, 80),
            modulo: pathParts[0] ?? 'Gateway',
            resultado: successful ? 'EXITO' : 'FALLO',
            severidad: successful ? 'INFO' : 'ADVERTENCIA',
            usuarioId: claims.sub ? Number(claims.sub) : undefined,
            email: claims.email,
            roles: claims.roles,
            recurso: pathParts[0],
            recursoId: pathParts[1],
            mensaje: `Respuesta HTTP ${response.statusCode}`,
            detalles: {
              statusCode: response.statusCode,
              duracionMs: Date.now() - startedAt,
            },
          });
        });
      }
      next();
    } catch {
      response
        .status(503)
        .json({ statusCode: 503, message: 'Auth service no disponible' });
    }
  });

  // Reverse proxy: se monta en la raiz con pathFilter para conservar la ruta
  // completa (ej. /tasks/123 llega igual al micro). Las rutas que no cumplen el
  // filtro (/, /health) pasan de largo (next) y las atiende Nest.
  const PROXIED_PREFIXES = [
    '/disponibilidad-servicios',
    '/tipos-autobus',
    '/instituciones',
    '/health',
    '/servicios',
    '/autobuses',
    '/conductores',
    '/licencias',
    '/docs',
    '/api-json',
    '/dashboard',
  ];
  app.use(
    createProxyMiddleware({
      target: target_one,
      changeOrigin: true,
      pathFilter: (pathname) =>
        PROXIED_PREFIXES.some(
          (p) => pathname === p || pathname.startsWith(`${p}/`),
        ),
    }),
  );

  const REPORTES_PREFIXES = ['/reportes'];
  app.use(
    createProxyMiddleware({
      target: target_three,
      changeOrigin: true,
      pathFilter: (pathname) =>
        REPORTES_PREFIXES.some(
          (p) => pathname === p || pathname.startsWith(`${p}/`),
        ),
    }),
  );

  const AUTH_PREFIXES = ['/auth', '/usuarios', '/roles', '/privilegios'];
  app.use(
    createProxyMiddleware({
      target: target_four,
      changeOrigin: true,
      xfwd: true,
      pathFilter: (pathname) =>
        AUTH_PREFIXES.some(
          (p) => pathname === p || pathname.startsWith(`${p}/`),
        ),
    }),
  );

  const OPERACIONES_PREFIXES = [
    '/configuraciones-operaciones',
    '/operaciones/health',
    '/viajes-base',
    '/rutas',
    '/salidas',
    '/calendario-viajes',
    '/compras',
    '/compradores',
    '/pagos',
  ];
  app.use(
    createProxyMiddleware({
      target: target_two,
      changeOrigin: true,
      pathFilter: (pathname) =>
        OPERACIONES_PREFIXES.some(
          (p) => pathname === p || pathname.startsWith(`${p}/`),
        ),
      on: {
        error: (error, _request, response) => {
          const res = response as any;

          if (res.headersSent) return;

          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              statusCode: 503,
              message:
                'operaciones-service no disponible. Levanta el backend en el puerto 5003.',
              target: target_two,
              error: error.message,
            }),
          );
        },
      },
    }),
  );

  await app.listen(port);
  console.log(`api-gateway escuchando en http://localhost:${port}`);
  console.log(`Reenviando /servicios, /docs y /api-json →${target_one}`);
  console.log(`Reenviando /operaciones, /docs y /api-json →${target_two}`);
  console.log(`Reenviando /dashboard, /docs y /api-json →${target_three}`);
  console.log(`Reenviando /auth, /docs y /api-json →${target_four}`);
}
bootstrap();
