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
import { MAPPINGS } from './mappings-data';
import { errorCodeTranslations } from './error-code-translations';
import { UserRole } from '@fc/shared/user/roles.enum';

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
    res.locals.helpers = {};

    res.locals.helpers = {};

    res.locals.APP_ROOT = appConfig.app_root;

    res.locals.APP_VERSION = appConfig.appVersion;

    res.locals.APP_ENVIRONMENT = appConfig.environment;

    res.locals.IS_PRODUCTION = appConfig.isProduction;

    res.locals.COMMIT_URL_PREFIX = appConfig.commitUrlPrefix;

    res.locals.GIT_CURRENT_BRANCH = appConfig.currentBranch;
    res.locals.GIT_LATEST_COMMIT_SHORT_HASH = appConfig.latestCommitShortHash;
    res.locals.GIT_LATEST_COMMIT_LONG_HASH = appConfig.latestCommitLongHash;

    res.locals.CURRENT_USER = req.user;

    res.locals.REQ_PARAMS = req.params;
    res.locals.REQ_QUERY = req.query;
    res.locals.moment = moment;
    res.locals.queryString = queryString;
    res.locals.title = appConfig.appName;

    res.locals.helpers.MAPPINGS = MAPPINGS;

    res.locals.ERROR_CODE_TRANSLATIONS = errorCodeTranslations;

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

    res.locals.helpers.getMapped = LocalsInterceptor.getMapped;

    res.locals.formatDate = LocalsInterceptor.formatDate;

    return next.handle();
  }

  static getMapped(mapping: object, key: string): string {
    if (typeof mapping[key] !== 'undefined') {
      return mapping[key];
    }
    return key;
  }

  static formatDate(input: string, granularity: string): string {
    if (granularity === 'all') {
      return 'Toute la période';
    }

    const date = moment(input);

    if (!date.isValid()) {
      throw Error(`Invalid date: <${input}>`);
    }
    switch (granularity) {
      case 'day':
        return date.format('DD/MM/YYYY');
      case 'week':
        return (
          'du ' +
          date.format('DD/MM') +
          ' au ' +
          date.add(7, 'days').format('DD/MM/YYYY')
        );
      case 'month':
        return date.format('MMM YYYY');
      case 'year':
        return date.format('YYYY');
      default:
        throw Error('granularity should be one of day|week|month|year|all');
    }
  }
}
