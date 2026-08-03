/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // ← NUEVO
import { apiReference } from '@scalar/nestjs-api-reference'; // ← NUEVO
import { AppModule } from './app.module';
import { formatErrors, ErrorOrigin } from '@commons/utils';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const port = process.env.PORT ?? 3001;
  const bodyLimit = process.env.JSON_BODY_LIMIT ?? '10mb';

  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { extended: true, limit: bodyLimit });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          errors: formatErrors(errors),
          errorOrigin: ErrorOrigin.VALIDATION,
        });
      },
    }),
  );

  // ← NUEVO: generar documento OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription(
      'API de autenticación con PostgreSQL + Redis para Nexoroute',
    )
    .setVersion('1.0')
    .build();

  // ← NUEVO: evita error de tipos duplicados con pnpm
  type NestApp = Parameters<typeof SwaggerModule.createDocument>[0];
  const nestApp = app as NestApp;

  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('api', nestApp, document); // Swagger UI en /api (opcional)

  // ← NUEVO: Scalar en /docs (sin theme: 'nestjs' — ya no existe en Scalar 1.2.x)
  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  // CORS: solo aceptamos el origen del api-gateway (allowlist).
  //app.enableCors({ origin: [process.env.GATEWAY_URL ?? 'http://localhost:5000'], methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'QUERY'], });

  await app.listen(port);
  console.log(`auth-service escuchando en http://localhost:${port}`);
  console.log(`Scalar docs en http://localhost:${port}/docs`); // ← NUEVO
  console.log(`OpenAPI JSON en http://localhost:${port}/api-json`); // ← NUEVO
}
bootstrap();
