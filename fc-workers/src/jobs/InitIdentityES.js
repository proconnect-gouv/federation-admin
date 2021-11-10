import { DateTime } from 'luxon';
import IndexMongoStats from './IndexMongoStats';
import Job from './Job';

/**
 * Values extract from xls on 05/10/2021
 */
export const HISTORICALS = [
  { date: '2016-01-31', value: 751 },
  { date: '2016-02-29', value: 966 },
  { date: '2016-03-31', value: 6264 },
  { date: '2016-04-30', value: 28299 },
  { date: '2016-05-31', value: 57323 },
  { date: '2016-06-30', value: 81562 },
  { date: '2016-07-31', value: 114131 },
  { date: '2016-08-31', value: 150366 },
  { date: '2016-09-30', value: 180294 },
  { date: '2016-10-31', value: 269299 },
  { date: '2016-11-30', value: 323976 },
  { date: '2016-12-31', value: 388936 },
  { date: '2017-01-31', value: 460309 },
  { date: '2017-02-28', value: 531280 },
  { date: '2017-03-31', value: 640340 },
  { date: '2017-04-30', value: 800387 },
  { date: '2017-05-31', value: 1185173 },
  { date: '2017-06-30', value: 1408315 },
  { date: '2017-07-31', value: 1517740 },
  { date: '2017-08-31', value: 1668099 },
  { date: '2017-09-30', value: 1886062 },
  { date: '2017-10-31', value: 2140808 },
  { date: '2017-11-30', value: 2535422 },
  { date: '2017-12-31', value: 2818200 },
  { date: '2018-01-31', value: 3200043 },
  { date: '2018-02-28', value: 3537586 },
  { date: '2018-03-31', value: 3956966 },
  { date: '2018-04-30', value: 4376755 },
  { date: '2018-05-31', value: 4833405 },
  { date: '2018-06-30', value: 5370169 },
  { date: '2018-07-31', value: 5747390 },
  { date: '2018-08-31', value: 6102240 },
  { date: '2018-09-30', value: 6531768 },
  { date: '2018-10-31', value: 7070048 },
  { date: '2018-11-30', value: 7547838 },
  { date: '2018-12-31', value: 7880091 },
  { date: '2019-01-31', value: 8384565 },
  { date: '2019-02-28', value: 8799991 },
  { date: '2019-03-31', value: 9254508 },
  { date: '2019-04-30', value: 9777968 },
  { date: '2019-05-31', value: 10406339 },
  { date: '2019-06-30', value: 10855478 },
  { date: '2019-07-31', value: 11295702 },
  { date: '2019-08-31', value: 11680585 },
  { date: '2019-09-30', value: 12218883 },
  { date: '2019-10-31', value: 12783219 },
  { date: '2019-11-30', value: 13240685 },
  { date: '2019-12-31', value: 13700056 },
  { date: '2020-01-31', value: 14347428 },
  { date: '2020-02-29', value: 14904300 },
  { date: '2020-03-31', value: 15318811 },
  { date: '2020-04-30', value: 15774981 },
  { date: '2020-05-31', value: 16370818 },
  { date: '2020-06-30', value: 17022018 },
  { date: '2020-07-31', value: 17514230 },
  { date: '2020-08-31', value: 17989477 },
  { date: '2020-09-30', value: 18610427 },
  { date: '2020-10-31', value: 19271188 },
  { date: '2020-11-30', value: 19832083 },
  { date: '2020-12-31', value: 20351527 },
  { date: '2021-01-31', value: 21074460 },
  { date: '2021-02-28', value: 21678731 },
  { date: '2021-03-31', value: 22371246 },
  { date: '2021-04-30', value: 23150619 },
  { date: '2021-05-31', value: 24249615 },
  { date: '2021-06-30', value: 26161427 },
  { date: '2021-07-31', value: 28699043 },
  { date: '2021-08-31', value: 29958752 },
  { date: '2021-09-30', value: 30782527 },
  { date: '2021-10-31', value: 31585865 },
];

const chunkSize = 1000;
const timePerRequest = 100;

class InitIdentityES extends Job {
  static usage() {
    return `
    Usage:
    > InitIdentityES`;
  }

  buildDocuments(rawData) {
    const header = {
      range: 'month',
      key: 'identity',
    };

    this.log.info('Build historical metric...');
    const data = rawData.map(historic => {
      // force UTC 00:00:00 time
      const date = DateTime.fromISO(historic.date, { zone: 'utc' })
        .startOf('day')
        .toISO();

      return {
        ...historic,
        date,
        ...header,
      };
    });
    return data;
  }

  async injectHistoric() {
    const { stats, config } = this.container.get(['stats', 'config']);

    const data = this.buildDocuments(HISTORICALS);

    const index = config.getElasticMetricsIndex();

    const createIdFn = ({ key, date, range }) =>
      IndexMongoStats.getMetricId({ key, date, range });

    const queries = stats.createBulkQuery(data, 'index', index, createIdFn);

    const delay = Math.floor((data.length / chunkSize) * timePerRequest) / 1000;
    this.log.info(
      `This will take at least ${delay.toFixed(2)} seconds, please hold on...`
    );

    this.log.info('Register historical metric...');
    await stats.executeBulkQuery(queries);
    this.log.info('Historical metric injected in ES');
  }

  async run() {
    try {
      await this.injectHistoric();
      this.log.info('All done');
    } catch (e) {
      this.log.error(e);
      process.exit(1);
    }
  }
}

InitIdentityES.description =
  'Initialize historical references for identities computation on a monthly basis';

export default InitIdentityES;
