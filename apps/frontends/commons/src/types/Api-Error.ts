export enum ErrorOrigin {
  VALIDATION = "VALIDATION",
  DATABASE = "DATABASE",
  BUSINESS = "BUSINESS",
  AUTH = "AUTH",
  GATEWAY = "GATEWAY",
  INTERNAL = "INTERNAL",
}

export type ApiErrorBody = {
  statusCode: number;
  message: string;
  path?: string;
  method?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
  errorOrigin?: ErrorOrigin;
};

export type StatusCode =
  | 400
  | 401
  | 403
  | 404
  | 405
  | 409
  | 422
  | 429
  | 500
  | 501
  | 502
  | 503
  | 504;
