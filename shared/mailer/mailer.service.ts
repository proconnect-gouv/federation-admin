import { Injectable, Inject } from '@nestjs/common';

import { MAILER_MODULE_OPTIONS } from './mailer.constant';
import { MailjetTransport } from './transporters/mailjet.transporter';
import { StdoutTransport } from './transporters/stdout.transporter';
import { IMailerParams, IMailerModuleOptions } from './interfaces';
import { Email } from './mailjet';

@Injectable()
export class MailerService {
  protected transporterMap = {
    mailjet: MailjetTransport,
    stdout: StdoutTransport,
  };
  protected transporter;
  constructor(
    @Inject(MAILER_MODULE_OPTIONS)
    private readonly transporterOptions: IMailerModuleOptions,
  ) {
    const { transport } = transporterOptions;
    const transporterClass = this.transporterMap[transport];
    if (!transporterClass) {
      throw new Error(`Unknown transport: ${transport}`);
    }
    this.transporter = new transporterClass(transporterOptions);
  }

  public async send(
    sendParamsMessage: Email.SendParamsMessage,
    mailerParams: IMailerParams,
  ) {
    try {
      return this.transporter.constructMessage(
        sendParamsMessage,
        mailerParams,
        this.transporterOptions,
      );
    } catch (error) {
      throw new Error(`Message cannot be constructed: ${error}`);
    }
  }
}
