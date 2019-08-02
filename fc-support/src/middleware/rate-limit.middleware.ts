import {
  NestMiddleware,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import * as rateLimit from 'express-rate-limit';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req, res, next: () => void): any {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15min
      max: 1, // limit each IP to 100 requests per windowMs
    });

    return limiter(req, res, next);
  }
}
