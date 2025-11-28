import {
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';

/**
 * Exception thrown when search rate limit is exceeded
 */
export class SearchRateLimitException extends HttpException {
  constructor(message = 'Search rate limit exceeded. Please try again later.') {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/**
 * Exception thrown when search query is invalid
 */
export class InvalidSearchQueryException extends BadRequestException {
  constructor(message: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Invalid search query: ${message}`,
      error: 'Bad Request',
    });
  }
}

/**
 * Exception thrown when search operation fails
 */
export class SearchFailedException extends HttpException {
  constructor(message = 'Search operation failed. Please try again.') {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
