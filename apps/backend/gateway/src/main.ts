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
    '/usuarios',
    '/auth',
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

  const OPERACIONES_PREFIXES = [
    '/configuraciones-operaciones',
    '/operaciones/health',
    '/viajes-base',
    '/rutas',
    '/salidas',
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
