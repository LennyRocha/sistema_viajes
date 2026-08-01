/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // ← NUEVO
import { apiReference } from '@scalar/nestjs-api-reference'; // ← NUEVO
import { AppModule } from './app.module';
import { formatErrors, ErrorOrigin } from '@commons/utils';
import { ValidationError } from 'class-validator';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3004;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: formatErrors(errors),
          errorOrigin: ErrorOrigin.VALIDATION,
        });
      },
    }),
  );

  // ← NUEVO: generar documento OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Dashboard - reportes Service')
    .setDescription(
      'API de gestión de reportes y visualización de dashboards con PostgreSQL + Redis + WebSockets para Nexoroute',
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

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin@localhost:5672'],
      queue: 'record_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(port);
  console.log(`record-service escuchando en http://localhost:${port}`);
  console.log(`websockets escuchando en ws://localhost:${port}`);
  console.log(`Scalar docs en http://localhost:${port}/docs`); // ← NUEVO
  console.log(`OpenAPI JSON en http://localhost:${port}/api-json`); // ← NUEVO
}
bootstrap();
