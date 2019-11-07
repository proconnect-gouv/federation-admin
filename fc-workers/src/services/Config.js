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
    const hosts = this.config.ES_STATS_HOSTS || 'localhost:9200';
    return { hosts: hosts.split(',') };
  }

  getLogElastic() {
    const hosts = this.config.ES_LOGS_HOSTS || 'localhost:9200';
    return { hosts: hosts.split(',') };
  }

  getMongo() {
    const {
      FC_DB_HOSTS,
      FC_DB_USER,
      FC_DB_PASSWORD,
      FC_DB_DATABASE,
    } = this.config;

    return `mongodb://${FC_DB_USER}:${FC_DB_PASSWORD}@${FC_DB_HOSTS}/${FC_DB_DATABASE}`;
  }
}

export default Config;
