import Mailer from './Mailer';
import * as nodemailer from 'nodemailer';

class SmtpMailer extends Mailer {
  constructor(config, logger) {
    super(config, logger);

    const { host, port, secure } = this.config.getMail();
    this.mailer = nodemailer.createTransport({
      host,
      port,
      secure,
    });
  }

  async send(params) {
    const { fromEmail, fromName, subject, body, recipients } = params;
    this.logger.log(`Sending mail to ${JSON.stringify(recipients, null, 2)}`);
    return this.mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipients,
      subject,
      html: body,
    });
  }
}

export default SmtpMailer;
