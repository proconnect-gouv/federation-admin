import Mailer from './Mailer';

class StdoutMailer extends Mailer {
  send(message) {
    return Promise.resolve(this.logger.log(JSON.stringify(message, null, 2)));
  }
}

export default StdoutMailer;
