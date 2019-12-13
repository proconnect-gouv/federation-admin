import crypto from 'crypto';
import Job from './Job';

class IndexElasticStats extends Job {
  static usage() {
    return `
      Usage:
      > IndexElasticStats --count=<activeAccount|usersPerFsCount> --start=<date> --range=<day|week|month|year>
    `;
  }

  static getMetricId(metric) {
    const { key, date, range } = metric;

    return crypto
      .createHash('sha256')
      .update([key, date, range].join('.'))
      .digest('hex');
  }

  async getMetric(metric, params) {
    const stats = this.container.get('stats');

    switch (metric) {
      case 'activeAccount':
        return stats.getActiveAccountsByRange(params);
      case 'usersPerFsCount':
      default:
        this.log.error('/!\\ Not implemented yet');
        return process.exit(1);
    }
  }

  async run(params) {
    const { input, stats } = this.container.get(['input', 'stats']);

    this.log.info('Input control');
    const schema = {
      count: { type: 'string', mandatory: true },
      start: { type: 'date', mandatory: true },
      range: { type: 'timeRange', mandatory: true },
    };

    const { count, start, range } = input.get(schema, params);

    this.log.info('Fecth data from logs');
    const value = await this.getMetric(count, { start, range });

    const doc = stats.createMetricDocument({
      key: count,
      value,
      date: start,
      range,
    });

    this.log.info('Create a unique consistant id for idempotence');
    const id = IndexElasticStats.getMetricId(doc);

    this.log.info('Save document to index');
    await stats.index(doc, 'stats', 'metric', id);

    this.log.info('All done');
  }
}

IndexElasticStats.description =
  'Compute data from elastic and index it in stats elastic';

export default IndexElasticStats;
