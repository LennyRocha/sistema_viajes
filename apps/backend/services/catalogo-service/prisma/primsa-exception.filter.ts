/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';
import { prismaErrorMap, ErrorOrigin } from '@commons/utils';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(PrismaExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    this.logger.error(
      {
        code: exception.code,
        meta: exception.meta,
        err: exception,
      },
      'Prisma exception caught',
    );
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      prismaErrorMap[exception.code] || HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception.code) {
      case 'P2002': {
        this.logger.warn(
          { meta: exception.meta },
          'Unique constraint violation',
        );
        const fields = exception.meta?.target as string[] | undefined;

        return response.status(statusCode).json({
          errorOrigin: ErrorOrigin.DATABASE,
          statusCode,
          message: fields?.length
            ? `Ya existe un registro con ${fields.join(', ')}.`
            : 'Ya existe un registro con esos datos.',
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        });
      }

      case 'P2025':
        this.logger.warn({ meta: exception.meta }, 'Record not found');
        return response.status(statusCode).json({
          errorOrigin: ErrorOrigin.DATABASE,
          statusCode,
          message: 'El registro no existe.',
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        });

      case 'P2000':
        this.logger.warn({ meta: exception.meta }, 'Value too long for column');
        return response.status(statusCode).json({
          errorOrigin: ErrorOrigin.DATABASE,
          statusCode,
          message: 'El valor es demasiado largo para la columna.',
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        });

      case 'P2003':
        this.logger.warn({ meta: exception.meta }, 'Foreign key violation');
        return response.status(statusCode).json({
          errorOrigin: ErrorOrigin.DATABASE,
          statusCode,
          message: 'Violación de clave foránea.',
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        });

      case 'P1017':
        this.logger.warn({ meta: exception.meta }, 'Database connection error');
        return response.status(statusCode).json({
          errorOrigin: ErrorOrigin.DATABASE,
          statusCode,
          message: 'Error de conexión a la base de datos.',
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        });

      case 'P1008':
        this.logger.warn({ meta: exception.meta }, 'Database timeout error');
        return response.status(statusCode).json({
          errorOrigin: ErrorOrigin.DATABASE,
          statusCode,
          message: 'Tiempo de espera agotado al conectarse a la base de datos.',
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        });

      case 'P2011':
        this.logger.warn({ meta: exception.meta }, 'Null constraint violation');
        return response.status(statusCode).json({
          errorOrigin: ErrorOrigin.DATABASE,
          statusCode,
          message: 'Violación de restricción de valor nulo.',
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        });

      default:
        this.logger.error({ err: exception }, 'Unhandled Prisma error');
        return response.status(statusCode).json({
          errorOrigin: ErrorOrigin.INTERNAL,
          statusCode,
          message: 'Error interno del servidor.',
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        });
    }
  }
}
