import {Injectable, Logger, NestMiddleware} from '@nestjs/common';
import {Request, Response} from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  /**
   * When a request comes in, log the endpoint which was called
   * @param req
   * @param res
   * @param next
   */
  use(req: Request, res: Response, next: () => void) {
    Logger.log(`${req.method} ${req.baseUrl}`, 'Request');
    next();
  }
}
