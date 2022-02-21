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

    return MAILER;
  }

  getMail() {
    const {
      HTTPS_PROXY,
      MAILER_HOST,
      MAILER_PORT,
      MAILER_SECURE,
      MAILER_IGNORE_TLS,
    } = this.config;

    return {
      proxyUrl: HTTPS_PROXY,
      host: MAILER_HOST,
      port: parseInt(MAILER_PORT, 10),
      secure: JSON.parse(MAILER_SECURE),
      ignoreTLS: JSON.parse(MAILER_IGNORE_TLS),
    };
  }

  getElasticOptions() {
    const {
      ES_STATS_HOSTS: hosts = 'localhost:9200',
      REQUEST_TIMEOUT,
    } = this.config;
    return {
      node: hosts.split(',').map(host => `http://${host}`),
      requestTimeout: REQUEST_TIMEOUT,
    };
  }

  getLogElastic() {
    const {
      ES_LOGS_HOSTS: hosts = 'localhost:9200',
      REQUEST_TIMEOUT,
    } = this.config;
    return {
      node: hosts.split(',').map(host => `http://${host}`),
      requestTimeout: REQUEST_TIMEOUT,
    };
  }

  getElasticMainIndex() {
    const { ES_MAIN_INDEX: index } = this.config;
    return index || 'franceconnect';
  }

  getElasticMetricsIndex() {
    const { ES_METRICS_INDEX: index } = this.config;
    return index || 'metrics';
  }

  getElasticEventsIndex() {
    const { ES_EVENTS_INDEX: index } = this.config;
    return index || 'events';
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
