import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseService {
  protected successResponse(data: any, message?: string) {
    return {
      success: true,
      message: message || 'Operation completed successfully',
      data,
    };
  }

  protected paginatedResponse(
    data: any[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  protected notFoundError(message: string) {
    return new HttpException(message, HttpStatus.NOT_FOUND);
  }

  protected forbiddenError(message: string) {
    return new HttpException(message, HttpStatus.FORBIDDEN);
  }

  protected conflictError(message: string) {
    return new HttpException(message, HttpStatus.CONFLICT);
  }

  protected badRequestError(message: string) {
    return new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}
