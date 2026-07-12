export default class ApiResponse<T> {
  private readonly success: boolean;
  private readonly status: number;
  private readonly message: string;
  private readonly data: T | null;
  private readonly code: number;

  constructor(
    success: boolean,
    status: number,
    message: string,
    data: T | null,
    code: number,
  ) {
    this.success = success;
    this.status = status;
    this.message = message;
    this.data = data;
    this.code = code;
  }

  static success<T>(
    status: number,
    message: string,
    data: T | null,
    code: number,
  ): ApiResponse<T> {
    return new ApiResponse<T>(
      true,
      status,
      message,
      data,
      code,
    );
  }

  static error<T>(
    status: number,
    message: string,
    data: T | null,
    code: number,
  ): ApiResponse<T> {
    return new ApiResponse<T>(
      false,
      status,
      message,
      data,
      code,
    );
  }
}
