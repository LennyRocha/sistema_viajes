import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ErrorOrigin, formatErrors } from '@commons/utils';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const port = process.env.PORT ?? 5003;
  const bodyLimit = process.env.JSON_BODY_LIMIT ?? '10mb';

  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { extended: true, limit: bodyLimit });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException({
          statusCode: 400,
          message: 'Error de validacion',
          errors: formatErrors(errors),
          errorOrigin: ErrorOrigin.VALIDATION,
        }),
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Operaciones Service')
    .setDescription('API de rutas, viajes base y configuraciones operativas')
    .setVersion('1.0')
    .build();

  type NestApp = Parameters<typeof SwaggerModule.createDocument>[0];
  const nestApp = app as NestApp;
  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('api', nestApp, document);
  app.use('/docs', apiReference({ content: document }));

  app.enableCors({ origin: '*' });

  await app.listen(port);
  console.log(`operaciones-service escuchando en http://localhost:${port}`);
  console.log(`Scalar docs en http://localhost:${port}/docs`);
  console.log(`OpenAPI JSON en http://localhost:${port}/api-json`);
}

bootstrap();
