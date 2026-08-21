import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';

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
  ];
  const privilegeForRequest = (pathname: string, method: string) => {
    if (pathname.startsWith('/usuarios')) {
      if (method === 'GET') return 'usuarios:consultar';
      if (method === 'POST') return 'usuarios:crear';
      if (method === 'PATCH') return 'usuarios:editar';
      if (pathname.includes('/status/')) return 'usuarios:estado';
      if (method === 'DELETE') return 'usuarios:eliminar';
    }
    if (pathname.startsWith('/rutas')) {
      if (method === 'GET') return 'calendario:consultar';
      if (method === 'POST') return 'ruta:crear';
      return 'viaje:editar';
    }
    if (pathname.startsWith('/viajes-base')) {
      if (method === 'GET') return 'calendario:consultar';
      if (method === 'POST') return 'viaje:abrir';
      return 'viaje:editar';
    }
    if (pathname.startsWith('/salidas')) {
      if (method === 'GET') return 'salida:consultar';
      if (method === 'POST') return 'viaje:abrir';
      if (method === 'DELETE') return 'salida:cancelar';
      return 'salida:reasignar';
    }
    if (pathname.startsWith('/calendario-viajes')) return 'calendario:consultar';
    if (pathname.startsWith('/conductores') && method === 'GET') return 'conductores:consultar';
    if (pathname.startsWith('/autobuses') && method === 'GET') return 'autobus:consultar';
    if (pathname.startsWith('/dashboard')) return 'calendario:consultar';
    return undefined;
  };

  app.use(async (request: any, response: any, next: any) => {
    const pathname = request.path as string;
    if (publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      next();
      return;
    }
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      response.status(401).json({ statusCode: 401, message: 'Bearer token requerido' });
      return;
    }
    try {
      const introspection = await fetch(`${target_four}/auth/introspect`, {
        headers: { authorization },
      });
      if (!introspection.ok) {
        response.status(401).json({ statusCode: 401, message: 'Access token invalido' });
        return;
      }
      const claims = await introspection.json() as { roles?: string[]; privileges?: string[] };
      const required = privilegeForRequest(pathname, request.method);
      const isAdmin = claims.roles?.includes('ROLE_ADMIN');
      const hasPrivilege = required && claims.privileges?.includes(required);
      if (required && !isAdmin && !hasPrivilege) {
        response.status(403).json({ statusCode: 403, message: 'Privilegio insuficiente', required });
        return;
      }
      next();
    } catch {
      response.status(503).json({ statusCode: 503, message: 'Auth service no disponible' });
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

  const AUTH_PREFIXES = ['/auth', '/usuarios', '/roles', '/privilegios'];
  app.use(
    createProxyMiddleware({
      target: target_four,
      changeOrigin: true,
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
