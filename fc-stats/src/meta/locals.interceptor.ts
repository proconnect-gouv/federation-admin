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

    res.locals.APP_ENVIRONMENT = appConfig.environment;
    res.locals.COMMIT_URL_PREFIX = appConfig.commitUrlPrefix;

    res.locals.GIT_CURRENT_BRANCH = appConfig.currentBranch;
    res.locals.GIT_LATEST_COMMIT_SHORT_HASH = appConfig.latestCommitShortHash;
    res.locals.GIT_LATEST_COMMIT_LONG_HASH = appConfig.latestCommitLongHash;

    res.locals.CURRENT_USER = req.user;

    res.locals.REQ_PARAMS = req.params;
    res.locals.REQ_QUERY = req.query;
    res.locals.moment = moment;
    res.locals.queryString = queryString;

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
    ];

    res.locals.helpers.getMapped = function getMapped(mapping, key) {
      if (typeof mapping[key] !== 'undefined') {
        return mapping[key];
      }
      return key;
    };

    res.locals.helpers.getChartTitle = function getChartTitle(key) {
      if (res.locals.helpers.MAPPINGS.chartTitle[key] !== undefined) {
        // tslint:disable-next-line: no-string-literal
        return res.locals.helpers.MAPPINGS['chartTitle'][key];
      }
      return key;
    };

    res.locals.formatDate = (date, granularity) => {
      switch (granularity) {
        case 'day':
          return moment(date).format('YYYY/MM/DD');
        case 'week':
          return (
            'du ' +
            moment(date).format('MM/DD') +
            ' au ' +
            moment(date)
              .add(7, 'days')
              .format('YYYY/MM/DD')
          );
        case 'month':
          return moment(date).format('YYYY/MM');
        case 'year':
          return moment(date).format('YYYY');
        case 'all':
          return 'Toute la période';
      }
    };

    return next.handle();
  }
}
