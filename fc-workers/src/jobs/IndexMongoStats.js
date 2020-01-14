import crypto from 'crypto';
import moment from 'moment';
import Job from './Job';

class IndexMongoStats extends Job {
  static usage() {
    return `
      Usage:
      > IndexMongoStats --count=<account|desactivated|registration> --start=<date> --range=<day|week|month|year>
    `;
  }

  async getMetric(metric, start, range) {
    const { account } = this.db.models;

    switch (metric) {
      case 'account':
        return account.countDocuments();

      case 'desactivated':
        return account.find({ active: false }).countDocuments();

      case 'registration':
        return IndexMongoStats.getRegistrationMetric(account, start, range);

      default:
        throw new Error(`Unknown metric: <${metric}>`);
    }
  }

  static getRegistrationMetric(account, start, range) {
    const stop = IndexMongoStats.getStopDateForRange(start, range);
    const query = {
      $and: [
        { createdAt: { $gte: new Date(start) } },
        { createdAt: { $lt: new Date(stop) } },
      ],
    };

    return account.find(query).countDocuments();
  }

  static getStopDateForRange(start, range) {
    return (
      moment(start)
        // Add given range
        .add(1, range)
        // Return a native javascript object
        .format('YYYY-MM-DD')
    );
  }

  static getMetricId(metric) {
    const { key, date } = metric;

    return crypto
      .createHash('sha256')
      .update([key, date].join('.'))
      .digest('hex');
  }

  async run(params) {
    try {
      this.log.info('Connection to database');
      // (async cause connection is made on demand)
      this.db = await this.container.get('fcDatabase');

      this.log.info('Input control');
      const input = this.container.get('input');
      const schema = {
        count: { type: 'string', mandatory: true },
        start: { type: 'date', mandatory: true },
        range: { type: 'timeRange', mandatory: true },
      };

      const { count, start, range } = input.get(schema, params);

      this.log.info(
        `Found parameters: ${JSON.stringify({ count, start, range })}`
      );

      this.log.info('Fetch the value we want from DB');
      const value = await this.getMetric(count, start, range);

      this.log.info('build a document');
      const statsService = this.container.get('stats');
      const doc = statsService.createMetricDocument({
        key: count,
        value,
        date: start,
        range,
      });

      this.log.info('Create a unique consistant id for idempotence');
      const id = IndexMongoStats.getMetricId(doc);

      this.log.info('Save document to index');
      await statsService.index(doc, 'metrics', id);
      this.log.info('All done');
    } finally {
      // Make sure we close connection
      this.db.connections[0].close();
    }
  }
}

IndexMongoStats.description =
  'Compute data from mongoDB and index it in stats elastic';

export default IndexMongoStats;
