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

    return next.handle();
  }
}
