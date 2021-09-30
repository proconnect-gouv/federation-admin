import crypto from 'crypto';
import moment from 'moment';
import Job from './Job';

class IndexMongoStats extends Job {
  static usage() {
    return `
      Usage:
      > IndexMongoStats --count=<account|activeFsCount|desactivated|registration> --start=<<YYYY-MM-DD>> --range=<day|week|month|year>`;
  }

  async getMetric(metric, start, range) {
    const db = await this.container.get('fcDatabase');
    const {
      models: { account, client },
    } = db;

    switch (metric) {
      case 'account':
        return account.countDocuments({ createdAt: { $lte: start } });

      case 'activeFsCount':
        return IndexMongoStats.getActiveFsMetric(client, start, range);

      case 'desactivated':
        return account.countDocuments({ active: false });

      case 'registration':
        return IndexMongoStats.getRegistrationMetric(account, start, range);

      default:
        throw new Error(`Unknown metric: <${metric}>`);
    }
  }

  static getActiveFsMetric(client, start, range) {
    const stop = IndexMongoStats.getStopDateForRange(start, range);
    const gte = new Date(Date.parse(start));
    const lte = new Date(Date.parse(stop));
    const query = {
      active: true,
      $and: [{ createdAt: { $gte: gte } }, { createdAt: { $lt: lte } }],
    };

    return client.countDocuments(query);
  }

  static getRegistrationMetric(account, start, range) {
    const stop = IndexMongoStats.getStopDateForRange(start, range);
    const gte = new Date(Date.parse(start));
    const lte = new Date(Date.parse(stop));
    const query = {
      $and: [{ createdAt: { $gte: gte } }, { createdAt: { $lt: lte } }],
    };

    return account.countDocuments(query);
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
    const { key, date, range } = metric;

    return crypto
      .createHash('sha256')
      .update([key, date, range].join('.'))
      .digest('hex');
  }

  async run(params) {
    let db;
    try {
      this.log.info('Connection to database');
      // (async cause connection is made on demand)
      db = await this.container.get('fcDatabase');

      this.log.info('Input control');
      const { input, config } = this.container.get(['input', 'config']);
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
      const index = config.getElasticMetricsIndex();
      await statsService.index(doc, index, id);

      this.log.info('All done');
    } finally {
      // Make sure we close connection
      db.connections[0].close();
    }
  }
}

IndexMongoStats.description =
  'Compute data from mongoDB and index it in stats elastic';

export default IndexMongoStats;
