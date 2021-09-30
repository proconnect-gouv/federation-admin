import moment from 'moment';
import _ from 'lodash';
import Job from './Job';
import IndexMongoStats from './IndexMongoStats';

const DATE_FORMAT = 'YYYY-MM-DD';

class InitMongoStats extends Job {
  static usage() {
    return `
      Usage:
      > InitMongoStats --metric=<registration>
    `;
  }

  async getMetric(metric) {
    const db = await this.container.get('fcDatabase');
    const {
      models: { account },
    } = db;

    switch (metric) {
      case 'registration':
        /**
         * We use a single aggregation at the day level and then generate data for the wider ranges.
         * It's easier done in pure javascript than in a Mongo aggregation and we need to fetch this data anyway.
         *
         * Disclaimer
         * Note that this works because we have a limited number of results (365 per year)
         * resulting in a limited number of documents (365 + 52 + 12 + 1 per year)
         * Do not do this for large datasets!
         */
        return InitMongoStats.getInitRegistrationMetric(account);

      default:
        throw new Error(`Unknown metric: <${metric}>`);
    }
  }

  /**
   * Fetch aggregation from MongoDB
   * @param {Model} account
   * @return Promise<array>
   */
  static async getInitRegistrationMetric(account) {
    return account.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);
  }

  /**
   * Generates a reducer to accumulate value of `count` property  into the first day of a period
   * @param {string} period a valid momentjs startof argument
   * @seee https://momentjs.com/docs/#/manipulating/start-of/
   * @return {array} reduced array, see tests for example
   */
  static periodReducer(period) {
    return (acc, { date, value }) => {
      const firstDayOfPeriod = moment(date, DATE_FORMAT)
        .startOf(period)
        .format(DATE_FORMAT);

      const periodValue = (acc[firstDayOfPeriod] || 0) + value;

      return {
        ...acc,
        [firstDayOfPeriod]: periodValue,
      };
    };
  }

  /**
   * Convert day based aggregation result to a a `period` based aggregation
   * @param {array} days
   * @param {string} period
   */
  static daysToPeriod(days, period) {
    const reducedAsObject = days.reduce(
      InitMongoStats.periodReducer(period),
      {}
    );

    return Object.entries(reducedAsObject).map(([date, value]) => ({
      date,
      value,
    }));
  }

  static daysToWeeks(days) {
    return InitMongoStats.daysToPeriod(days, 'isoWeek');
  }

  static daysToMonths(days) {
    return InitMongoStats.daysToPeriod(days, 'month');
  }

  static daysToYears(days) {
    return InitMongoStats.daysToPeriod(days, 'year');
  }

  static resultToDoc(results, key, range) {
    return results.map(result => ({
      ...result,
      key,
      range,
    }));
  }

  async run(params) {
    let db;
    try {
      this.log.info('Connection to database');
      // (async cause connection is made on demand)
      db = await this.container.get('fcDatabase');

      this.log.info('Input control');
      const input = this.container.get('input');
      const schema = {
        metric: { type: 'string', mandatory: true },
      };

      const { metric } = input.get(schema, params);

      this.log.info(`Found parameters: ${JSON.stringify({ metric })}`);

      this.log.info('Fetch the values we want from DB');
      const values = await this.getMetric(metric);

      // Remove invalid values such as empty createdAt
      const dayValues = values
        .filter(
          // MongoDB field
          // eslint-disable-next-line no-underscore-dangle
          value => value._id
        )
        .map(({ _id, count }) => ({ date: _id, value: count }));
      const weekValues = InitMongoStats.daysToWeeks(dayValues);
      const monthsValues = InitMongoStats.daysToMonths(dayValues);
      const yearValues = InitMongoStats.daysToYears(dayValues);

      const docList = [].concat(
        InitMongoStats.resultToDoc(dayValues, metric, 'day'),
        InitMongoStats.resultToDoc(weekValues, metric, 'week'),
        InitMongoStats.resultToDoc(monthsValues, metric, 'month'),
        InitMongoStats.resultToDoc(yearValues, metric, 'year')
      );

      this.log.info('Post new entries to metric index');

      const chunkSize = 1000;
      const timePerRequest = 100;
      const delay = Math.floor(
        ((docList.length / chunkSize) * timePerRequest) / 1000
      );
      this.log.info(
        `   > This will take at least ${delay} seconds, please hold on...`
      );

      await this.createDocuments(docList, chunkSize, timePerRequest, 0);
      this.log.info('All done');
    } finally {
      // Make sure we close connection
      db.connections[0].close();
    }
  }

  async createDocuments(docList, chunkLength, timePerRequest, delay) {
    const { stats, config } = this.container.get(['stats', 'config']);

    const chunks = _.chunk(docList, chunkLength);

    const createIdFn = ({ key, date, range }) =>
      IndexMongoStats.getMetricId({ key, date, range });

    const index = config.getElasticMetricsIndex();

    const queries = chunks.map(chunk =>
      stats.createBulkQuery(chunk, 'index', index, createIdFn)
    );

    const promises = queries.map((query, idx) => {
      const timeout = delay + timePerRequest * idx;
      return new Promise(res => {
        setTimeout(() => {
          res(stats.executeBulkQuery(query));
        }, timeout);
      });
    });

    return Promise.all(promises);
  }
}

InitMongoStats.description =
  'Initialize data from mongoDB and index it in stats elastic';

export default InitMongoStats;
