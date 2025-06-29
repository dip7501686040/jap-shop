export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export function createResponse<T>(
  data: T,
  message?: string,
  success: boolean = true,
): ApiResponse<T> {
  return {
    data,
    message,
    success,
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
): ApiResponse<T> {
  return createResponse(data, message, true);
}

export function createErrorResponse<T>(
  data: T,
  message: string,
): ApiResponse<T> {
  return createResponse(data, message, false);
}
