import { HttpStatus } from "@nestjs/common";

const prismaErrorMap = {
  P2000: HttpStatus.BAD_REQUEST,
  P2002: HttpStatus.CONFLICT,
  P2003: HttpStatus.BAD_REQUEST,
  P2011: HttpStatus.BAD_REQUEST,
  P2025: HttpStatus.NOT_FOUND,
  P1017: HttpStatus.SERVICE_UNAVAILABLE,
  P1008: HttpStatus.GATEWAY_TIMEOUT,
} as const;

export default prismaErrorMap;
