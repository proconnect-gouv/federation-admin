class Config {
  constructor(config) {
    this.config = config;
  }

  getElastic() {
    const { ES_HOST, ES_PORT } = this.config;

    return { host: `${ES_HOST || 'localhost'}:${ES_PORT || '9200'}` };
  }
}

export default Config;
