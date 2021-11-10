import { DateTime } from 'luxon';
import _ from 'lodash';
import Job from './Job';
import { sleep } from '../utils';
import IndexMongoStats from './IndexMongoStats';

export const isLastDayOfMonth = date => {
  const ref = DateTime.fromISO(date, { zone: 'utc' });
  return ref.endOf('month').hasSame(ref, 'day');
};

class InitMongoStats extends Job {
  static usage() {
    return `
      Usage:
      > InitMongoStats --metric=<registration|identity>
    `;
  }

  async getData(metric) {
    const db = await this.container.get('fcDatabase');
    const {
      models: { account },
    } = db;

    switch (metric) {
      case 'registration':
      case 'identity':
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
    // we want only full day so we exclude current date
    const exclude = DateTime.now()
      .setZone('utc')
      .startOf('day')
      .toISODate();

    const groupByDate = {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    };

    const renameData = {
      $project: {
        _id: 0,
        date: '$_id',
        value: '$count',
      },
    };

    const excludeTodayAndNull = {
      $match: {
        $and: [
          {
            date: {
              $ne: exclude,
            },
          },
          {
            date: {
              $ne: null,
            },
          },
        ],
      },
    };

    return account.aggregate([groupByDate, renameData, excludeTodayAndNull]);
  }

  /**
   * Generates a reducer to accumulate value of `count` property  into the first day of a period
   * @param {string} period a valid momentjs startof argument
   * @seee https://momentjs.com/docs/#/manipulating/start-of/
   * @return {array} reduced array, see tests for example
   */
  static periodReducer(period) {
    return (acc, { date, value }) => {
      const firstDayOfPeriod = DateTime.fromISO(date)
        .startOf(period)
        .toISODate();

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
    return InitMongoStats.daysToPeriod(days, 'week');
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

  static buildScaleFromMetrics(metricData, key) {
    const weekValues = InitMongoStats.daysToWeeks(metricData);
    const monthsValues = InitMongoStats.daysToMonths(metricData);
    const yearValues = InitMongoStats.daysToYears(metricData);

    const docList = [].concat(
      InitMongoStats.resultToDoc(metricData, key, 'day'),
      InitMongoStats.resultToDoc(weekValues, key, 'week'),
      InitMongoStats.resultToDoc(monthsValues, key, 'month'),
      InitMongoStats.resultToDoc(yearValues, key, 'year')
    );
    return docList;
  }

  // eslint-disable-next-line class-methods-use-this
  selectDaysToRegister(metricData, lastDate) {
    const referenceDate = DateTime.fromISO(lastDate, { zone: 'utc' });

    const computeData = metricData
      .filter(
        ({ date }) => DateTime.fromISO(date, { zone: 'utc' }) > referenceDate
      )
      .sort(({ date: a }, { date: b }) => {
        // dates are in format : yyyy-mm-dd
        const timeA = a.split('-').join('');
        const timeB = b.split('-').join('');
        return timeA - timeB;
      });
    return computeData;
  }

  computeMetricDocs({ data, identities, key }) {
    let cumul = identities;
    const daily = data.map(({ date, value }) => {
      cumul += value;
      return {
        key,
        date,
        value: cumul,
        range: 'day',
      };
    });

    this.log.info(` > Current account number: ${cumul} persons`);

    const monthly = daily
      .filter(({ date }) => isLastDayOfMonth(date))
      .map(doc => ({
        ...doc,
        range: 'month',
      }));

    this.log.info(` > Number of daily docs to registered: ${daily.length}`);
    this.log.info(` > Number of monthly docs to registered: ${monthly.length}`);

    return [...daily, ...monthly];
  }

  async buildAccountFromMetrics(metricData, key) {
    const { stats } = this.container.get(['stats']);

    // only full days must be registered...
    const startDate = DateTime.now()
      .setZone('utc')
      .startOf('day')
      .minus({ days: 1 })
      .toISO();

    this.log.info(` > Select measure date : ${startDate}`);

    const { identities, lastDate } = await stats.getLastAccountNumber({
      date: startDate,
    });

    this.log.info(
      ` > Last account number: ${identities} persons on ${lastDate}`
    );

    const data = this.selectDaysToRegister(metricData, lastDate);

    const docs = this.computeMetricDocs({
      data,
      identities,
      key,
    });
    return docs;
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

    const jobs = queries.map(async (query, idx) => {
      const timeout = delay + timePerRequest * idx;
      await sleep(timeout);
      return stats.executeBulkQuery(query);
    });

    return Promise.all(jobs);
  }

  async computeData(metricData, key) {
    switch (key) {
      case 'registration':
        return InitMongoStats.buildScaleFromMetrics(metricData, key);
      case 'identity':
        return this.buildAccountFromMetrics(metricData, key);
      default:
        throw new Error(`Unknown metric: <${key}>`);
    }
  }

  prepareDocs(dataList) {
    const stats = this.container.get('stats');

    return dataList.map(raw => stats.createMetricDocument(raw));
  }

  async run(params) {
    let db;
    try {
      this.log.info('Connection to database');
      // (async cause connection is made on demand)
      db = await this.container.get('fcDatabase');
      const input = this.container.get('input');

      this.log.info('Input control');
      const schema = {
        metric: { type: 'string', mandatory: true },
      };

      const { metric: key } = input.get(schema, params);

      this.log.info(`Found parameters: ${JSON.stringify({ metric: key })}`);

      this.log.info('Fetch the values we want from DB');
      const metricData = await this.getData(key);

      const computeList = await this.computeData(metricData, key);

      const docList = this.prepareDocs(computeList);

      this.log.info('Post new entries to metric index');

      const chunkSize = 1000;
      const timePerRequest = 100;
      const delay =
        Math.floor((docList.length / chunkSize) * timePerRequest) / 1000;
      this.log.info(
        ` > This will take at least ${delay.toFixed(
          2
        )} seconds, please hold on...`
      );

      await this.createDocuments(docList, chunkSize, timePerRequest, delay);
      this.log.info('All done');
    } finally {
      // Make sure we close connection
      db.connections[0].close();
    }
  }
}

InitMongoStats.description =
  'Initialize data from mongoDB and index it in stats elastic';

export default InitMongoStats;
