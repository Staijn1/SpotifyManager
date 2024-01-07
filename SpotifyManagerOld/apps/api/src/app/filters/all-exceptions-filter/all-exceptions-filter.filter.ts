import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  /**
   * Catch all HTTP exceptions and log them, before passing them to the super class.
   * @param exception
   * @param host
   */
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      Logger.error(`HTTP Exception occurred: ${exception.message}`, exception.stack, 'ExceptionFilter');
    }
    super.catch(exception, host);
  }
}
