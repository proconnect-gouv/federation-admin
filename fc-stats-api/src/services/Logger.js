/* eslint-disable no-console */
class Logger {
  constructor() {
    this.logger = console;
  }

  log(...args) {
    this.logger.log(...args);
  }

  error(...args) {
    this.logger.error(...args);
  }

  info(...args) {
    this.logger.info(...args);
  }

  debug(...args) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.log(...args);
    }
  }
}

export default Logger;
