/* eslint-disable no-console */
class Logger {
  constructor(transformer = (...args) => args) {
    this.logger = console;
    this.transformer = transformer;
  }

  log(args) {
    this.logger.log(...this.transformer(args));
  }

  error(args) {
    this.logger.error(...this.transformer(args));
  }

  info(args) {
    this.logger.info(...this.transformer(args));
  }

  debug(args) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.log(...this.transformer(args));
    }
  }
}

export default Logger;
