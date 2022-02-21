import SmtpMailer from './SmtpMailer';
import StdoutMailer from './StdoutMailer';

const classMap = {
  smtp: SmtpMailer,
  log: StdoutMailer,
};

const instances = {};

class MailerFactory {
  static get(instanceType, container) {
    if (typeof classMap[instanceType] === 'undefined') {
      throw new Error(`Unknow mailer type: <${instanceType}>`);
    }

    if (!(instances[instanceType] instanceof classMap[instanceType])) {
      instances[instanceType] = new classMap[instanceType](
        container.get('config'),
        container.get('logger')
      );
    }

    return instances[instanceType];
  }
}

export default MailerFactory;
