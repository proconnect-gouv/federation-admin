import { Injectable, Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import * as mailjet from 'node-mailjet';

import { Transport } from './transport';
import { Email } from '../mailjet';
import { IMailerParams, IMailerModuleOptions } from '../interfaces';

@Injectable()
export class MailjetTransport extends Transport {
  protected message: Email.SendParams;
  protected isValidMessage: ValidationError[];

  private readonly logger = new Logger('StdoutTransport');
  constructor() {
    super();
  }

  async constructMessage(
    sendParamsMessage: Email.SendParamsMessage,
    mailerParams: IMailerParams,
    transporterOptions: IMailerModuleOptions,
  ) {
    try {
      this.isValidMessage = await this.isValid(sendParamsMessage);
    } catch (error) {
      throw new Error(`The message is not valid: ${error}`);
    }

    try {
      this.message = await this.setEmailBody(
        sendParamsMessage,
        mailerParams,
        transporterOptions,
      );
    } catch (error) {
      throw new Error(`Cannot set body of email: ${error}`);
    }

    const {
      emailOptions: { mailjetKey, mailjetSecret },
    } = transporterOptions;

    try {
      const mailjetConnection = await this.mailjetAuthenticate(
        mailjetKey,
        mailjetSecret,
      );

      return mailjetConnection
        .post('send', { version: 'v3.1' })
        .request(this.message);
    } catch (error) {
      this.logger.error(`Mailjet authentification failed: ${error}`);
      throw new Error(`Mailjet authentification failed: ${error}`);
    }
  }

  async mailjetAuthenticate(key, secret) {
    return mailjet.connect(key, secret);
  }
}
