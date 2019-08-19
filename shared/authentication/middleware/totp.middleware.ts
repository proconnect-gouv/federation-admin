import { NestMiddleware, Inject } from '@nestjs/common';
import { InjectConfig } from 'nestjs-config';

export class TotpMiddleware implements NestMiddleware {
  public constructor(
    @InjectConfig() private readonly config,
    @Inject('otplib') private readonly otplibService,
  ) {
    // setting
    otplibService.authenticator.options = {
      algorithm: this.config.get('totp').totpAlgo,
    };
  }

  use(req, res, next: () => void): any {
    if (
      !this.otplibService.authenticator.check(req.body._totp, req.user.secret)
    ) {
      req.totp = 'invalid';
    } else {
      req.totp = 'valid';
    }

    return next();
  }
}
