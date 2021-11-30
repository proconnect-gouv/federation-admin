import { LoggerService } from '@fc/shared/logger/logger.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { Observable } from 'rxjs';

@Injectable()
export class StatsApiGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  private getToken(request): string | null {
    try {
      const {
        headers: { authorization },
      } = request;
      const BEARER_PATTERN = /^Bearer ([\w-_.=+]{10,64})$/;
      const token = authorization.match(BEARER_PATTERN);

      if (!token) {
        this.logger.error(
          'The access token in the current request have the wrong format.',
        );
      }
      return token ? token[1] : null;
    } catch (error) {
      this.logger.error(
        error,
        'There is no access token in the current request.',
      );
      return null;
    }
  }

  private checkTokenValidity(
    requestToken: string,
    configToken: string,
  ): boolean {
    if (requestToken !== configToken) {
      this.logger.error('Request token does not match the registered token.');
      return false;
    }
    return true;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { usersWebsiteToken } = this.config.get('stats-api');
    const request = context.switchToHttp().getRequest();
    const requestApiToken = this.getToken(request);

    const isTokenValid = this.checkTokenValidity(
      requestApiToken,
      usersWebsiteToken,
    );

    return isTokenValid;
  }
}
