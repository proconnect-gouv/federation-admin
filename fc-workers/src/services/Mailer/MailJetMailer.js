import mailjet from 'node-mailjet';
import Mailer from './Mailer';

class MailJetMailer extends Mailer {
  constructor(config, logger) {
    super(config, logger);
    const { key, secret } = this.config;
    this.mailer = mailjet.connect(key, secret);
  }

  static mapParams(params) {
    const { fromEmail, fromName, subject, body, recipients } = params;

    return {
      FromEmail: fromEmail,
      FromName: fromName,
      Subject: subject,
      'HTML-part': body,
      Recipients: recipients,
    };
  }

  send(params) {
    this.logger.log(
      `Sending mail to ${JSON.stringify(params.recipients, null, 2)}`
    );
    return this.mailer.post('send').request(MailJetMailer.mapParams(params));
  }
}

export default MailJetMailer;
