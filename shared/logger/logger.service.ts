import { ConfigService, InjectConfig } from 'nestjs-config';
import * as pino from 'pino';

export interface ILoggerService {
  fatal(log: any): void;
  error(log: any): void;
  warn(log: any): void;
  info(log: any): void;
  debug(log: any): void;
  trace(log: any): void;
}

let logger: any;

export class LoggerService implements ILoggerService {
  constructor(@InjectConfig() readonly config: ConfigService) {
    logger = pino(pino.destination(this.config.get('logger.path')));
  }

  fatal(log: any) {
    return logger.fatal(log);
  }

  error(log: any) {
    return logger.error(log);
  }

  warn(log: any) {
    return logger.warn(log);
  }

  info(log: any) {
    return logger.info(log);
  }

  debug(log: any) {
    return logger.debug(log);
  }

  trace(log: any) {
    return logger.trace(log);
  }
}
