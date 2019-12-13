import uuid from 'uuid/v4';

class Job {
  constructor(container) {
    this.container = container;
    this.id = uuid();
    this.log = this.container.get('logger');
    this.log.transformer = this.logTransformer.bind(this);
  }

  logTransformer(...args) {
    const lines = args.map(arg =>
      typeof arg !== 'string'
        ? `${this.id} | ${JSON.stringify(arg)}`
        : arg
            .split('\n')
            .map(line => `${this.id} | ${line}`)
            .join('\n')
    );
    return lines;
  }
}

export default Job;
