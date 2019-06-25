class Config {
  constructor(config) {
    this.config = config;
  }

  getAPIRoot() {
    const { API_ROOT } = this.config;

    return API_ROOT || 'http://localhost:3000/api/v1';
  }

  getMailerType() {
    const { MAILER } = this.config;

    return MAILER || 'log';
  }

  getMailjet() {
    const { MAILJET_KEY, MAILJET_SECRET } = this.config;

    return { key: MAILJET_KEY, secret: MAILJET_SECRET };
  }

  getElastic() {
    const { ES_HOST, ES_PORT } = this.config;

    return { host: `${ES_HOST || 'localhost'}:${ES_PORT || '9200'}` };
  }
}

export default Config;
