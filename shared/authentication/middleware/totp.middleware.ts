import { NestMiddleware, Inject } from '@nestjs/common';
import { AuthenticationDto } from '@fc/shared/authentication/dto/authentication.dto';
import { AuthenticationService } from '@fc/shared/authentication/authentication.service';
import { LoggerService } from '@fc/shared/logger/logger.service';
import {
  AuthenticationActions,
  AuthenticationStates,
} from '@fc/shared/authentication/authentication-actions.enum';

export class TotpMiddleware implements NestMiddleware {
  public constructor(
    @Inject('otplib') private readonly otplibService,
    private readonly authenticationService: AuthenticationService,
    private readonly logger: LoggerService,
  ) {}

  use(req, res, next: () => void): any {
    if (req.user) {
      this.totpInForm(req, next);
    } else {
      this.totpInLogging(req, res, next);
    }
  }

  private totpInForm(req, next) {
    if (
      !this.otplibService.authenticator.check(req.body._totp, req.user.secret)
    ) {
      req.totp = 'invalid';
    } else {
      req.totp = 'valid';
    }

    return next();
  }

  private async totpInLogging(req, res, next) {
    const { username, _totp }: AuthenticationDto = req.body;
    req.userSecret = await this.authenticationService.getUserSecret(username);
    if (req.userSecret === null) {
      this.authenticationService.saveUserAuthenticationFailure(username, null);
      this.logger.businessEvent({
        action: AuthenticationActions.TOTP,
        state: AuthenticationStates.DENIED_USER_NOT_FOUND,
        user: username,
      });
      req.flash('globalError', 'Connexion impossible.');
      res.redirect('login');
    } else {
      if (this.otplibService.authenticator.check(_totp, req.userSecret)) {
        return next();
      } else {
        this.authenticationService.saveUserAuthenticationFailure(
          username,
          null,
        );
        this.logger.businessEvent({
          action: AuthenticationActions.TOTP,
          state: AuthenticationStates.DENIED_TOTP,
          user: username,
        });
        req.flash('globalError', 'Connexion impossible.');
        res.redirect('login');
      }
    }
  }
}
