import { ITemplateAdapter } from './template-adapter.interface';
import { ConfigOptions } from '../mailjet';

export interface IMailerModuleOptions {
  transport: string;
  emailOptions?: {
    mailjetKey: string;
    mailjetSecret: string;
    smtpSenderName: string;
    smtpSenderEmail: string;
    options?: ConfigOptions;
  };
  template?: {
    dir?: string;
    adapter?: ITemplateAdapter;
    options?: { [name: string]: any };
  };
}
