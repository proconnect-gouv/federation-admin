import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly configuration: any) {}

  catch(exception: unknown, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    if (req.user) {
      res.locals.CURRENT_USER = req.user;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR ||
      status === HttpStatus.PAYLOAD_TOO_LARGE ||
      status === HttpStatus.NOT_FOUND ||
      status === HttpStatus.FORBIDDEN ||
      status === HttpStatus.BAD_REQUEST
    ) {
      Logger.error(exception);

      res.status(status).render(`exception/${status}.ejs`, {
        APP_ROOT: this.configuration.app_root,
        APP_ENVIRONMENT: this.configuration.environment,
        GIT_CURRENT_BRANCH: this.configuration.currentBranch,
        COMMIT_URL_PREFIX: this.configuration.commitUrlPrefix,
        GIT_LATEST_COMMIT_LONG_HASH: this.configuration.latestCommitLongHash,
        GIT_LATEST_COMMIT_SHORT_HASH: this.configuration.latestCommitShortHash,
      });
    } else if (status === HttpStatus.UNAUTHORIZED) {
      res.redirect(`${this.configuration.app_root}/login`);
    } else {
      Logger.error(exception);

      res.status(status).json({
        statusCode: status,
        timestamp: Date.now(),
        path: req.url,
      });
    }
  }
}
