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

  getLogElastic() {
    const { ES_LOG_HOST, ES_LOG_PORT } = this.config;

    return { host: `${ES_LOG_HOST || 'localhost'}:${ES_LOG_PORT || '9200'}` };
  }

  getMongo() {
    const {
      FC_DB_HOSTS,
      FC_DB_PORT,
      FC_DB_USER,
      FC_DB_PASSWORD,
      FC_DB_DATABASE,
    } = this.config;

    return `mongodb://${FC_DB_USER}:${FC_DB_PASSWORD}@${FC_DB_HOSTS}:${FC_DB_PORT}/${FC_DB_DATABASE}`;
  }
}

export default Config;
