class Config {
  constructor(config) {
    this.config = config;
  }

  getElastic() {
    const { ES_HOST, ES_PORT } = this.config;

    return { host: `${ES_HOST || 'localhost'}:${ES_PORT || '9200'}` };
  }

  getPort() {
    const { PORT } = this.config;

    return PORT || 3000;
  }
}

export default Config;
