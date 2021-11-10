/* eslint-disable max-classes-per-file */
/* eslint-disable import/extensions */
import { DateTime } from 'luxon';

import { getDayArray, getRandomInt } from '../../src/utils/index.js';
import Container, {
  Config,
  Logger,
  FcDatabase,
} from '../../src/services/index.js';

const MAX_OCCURENCES_PER_DAY = 30;
const FAKE_STARTING_DATE = '2019-01-01';

class SimulateMongoStats {
  constructor(container) {
    this.container = container;
    this.log = this.container.get('logger');
  }

  // eslint-disable-next-line class-methods-use-this
  buildDocuments(start, stop) {
    const allDays = getDayArray(start, stop);

    const first = allDays[0];
    const last = allDays[allDays.length - 1];
    this.log.info(`Build fake data in interval: ${first}:${last}`);

    const allInsert = allDays
      .map(date => {
        const entries = getRandomInt(MAX_OCCURENCES_PER_DAY, 1);
        return Array.from({ length: entries }, (_no, i) => ({
          // to track fake data
          id: 'test',
          identityHash: `${i}`,
          createdAt: date,
        }));
      })
      .flat();

    return allInsert;
  }

  async injectRegistration(db) {
    const {
      models: { account },
    } = db;

    // clean previous fake data
    await account.deleteMany({ id: 'test' });

    const start = DateTime.fromISO(FAKE_STARTING_DATE, { zone: 'utc' });
    const stop = DateTime.now()
      .setZone('utc')
      .startOf('day');

    this.log.info('> build fake entries for user registration');
    const allInsert = this.buildDocuments(start, stop);

    this.log.info('> insert fake entries in database');

    const results = await account.insertMany(allInsert);
    this.log.info(`> fake entries in mongoDb done : ${results.length}`);
  }

  async run() {
    let db;
    try {
      this.log.info('Connection to database');
      // (async cause connection is made on demand)
      db = await this.container.get('fcDatabase');

      await this.injectRegistration(db);

      this.log.info('All done');
    } catch (e) {
      this.log.error(e);
      process.exit(1);
    } finally {
      // Make sure we close connection
      db.connections[0].close();
    }
  }
}

const container = new Container();

container.add('logger', () => new Logger());
container.add('config', () => new Config(process.env));
container.add('fcDatabase', () =>
  FcDatabase.getInstance(container.get('config').getMongo())
);

async function main() {
  try {
    const job = new SimulateMongoStats(container);
    await job.run();
  } catch (e) {
    container.get('logger').error(e);
  }
}

main();
