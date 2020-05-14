class Config {
  constructor(config) {
    this.config = config;
  }

  getAPIRoot() {
    const { API_ROOT } = this.config;

    return API_ROOT || 'http://localhost:3000/api/v1';
  }

  getAPIKey() {
    const { API_KEY = '' } = this.config;

    return API_KEY;
  }

  getMailerType() {
    const { MAILER } = this.config;

    return MAILER || 'log';
  }

  getMailjet() {
    const { MAILJET_KEY, MAILJET_SECRET, HTTPS_PROXY } = this.config;

    return {
      key: MAILJET_KEY,
      secret: MAILJET_SECRET,
      options: {
        proxyUrl: HTTPS_PROXY,
      },
    };
  }

  getElastic() {
    const hosts = this.config.ES_STATS_HOSTS || 'localhost:9200';
    return {
      node: hosts.split(',').map(host => `http://${host}`),
      requestTimeout: process.env.REQUEST_TIMEOUT,
    };
  }

  getLogElastic() {
    const hosts = this.config.ES_LOGS_HOSTS || 'localhost:9200';
    return {
      node: hosts.split(',').map(host => `http://${host}`),
      requestTimeout: process.env.REQUEST_TIMEOUT,
    };
  }

  getMongo() {
    const {
      FC_DB_HOSTS,
      FC_DB_USER,
      FC_DB_PASSWORD,
      FC_DB_DATABASE,
      FC_DB_CONNECT_OPTIONS,
    } = this.config;

    return `mongodb://${FC_DB_USER}:${FC_DB_PASSWORD}@${FC_DB_HOSTS}/${FC_DB_DATABASE}${FC_DB_CONNECT_OPTIONS}`;
  }
}

export default Config;
