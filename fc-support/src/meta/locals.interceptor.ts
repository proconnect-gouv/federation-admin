import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from 'nestjs-config';
import * as moment from 'moment';
import * as queryString from 'query-string';
import { UserRole } from '@fc/shared/user/roles.enum';
import { errorCodeTranslations } from './error-code-translations';
import { VALID_INPUT_STRING_REGEX } from '@fc/shared/validators/is-valid-input-string';

@Injectable()
export class LocalsInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const appConfig = this.configService.get('app');

    res.locals.APP_ROOT = appConfig.app_root;

    res.locals.APP_VERSION = appConfig.appVersion;

    res.locals.APP_ENVIRONMENT = appConfig.environment;

    res.locals.IS_PRODUCTION = appConfig.isProduction;

    res.locals.COMMIT_URL_PREFIX = appConfig.commitUrlPrefix;

    res.locals.GIT_CURRENT_BRANCH = appConfig.currentBranch;
    res.locals.GIT_LATEST_COMMIT_SHORT_HASH = appConfig.latestCommitShortHash;
    res.locals.GIT_LATEST_COMMIT_LONG_HASH = appConfig.latestCommitLongHash;

    res.locals.ERROR_CODE_TRANSLATIONS = errorCodeTranslations;
    res.locals.title = appConfig.appName;

    res.locals.USER_ROLES_OPTIONS = [
      { label: 'Administrateur', value: UserRole.ADMIN },
      { label: 'Exploitant', value: UserRole.OPERATOR },
      { label: 'Sécurité', value: UserRole.SECURITY },
      { label: 'Nouvel utilisateur', value: UserRole.NEWUSER },
      { label: 'Administrateur inactif', value: UserRole.INACTIVE_ADMIN },
      { label: 'Exploitant inactif', value: UserRole.INACTIVE_OPERATOR },
      { label: 'Sécurité inactif', value: UserRole.INACTIVE_SECURITY },
      { label: 'Utilisateur bloqué', value: UserRole.BLOCKED_USER },
    ];

    res.locals.CURRENT_USER = req.user;

    res.locals.VALID_INPUT_STRING_REGEX = VALID_INPUT_STRING_REGEX.source;
    res.locals.REQ_PARAMS = req.params;
    res.locals.REQ_QUERY = req.query;
    res.locals.moment = moment;
    res.locals.queryString = queryString;

    return next.handle();
  }
}
