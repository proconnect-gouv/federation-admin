// eslint-disable-next-line import/no-extraneous-dependencies
import { Command, InvalidOptionArgumentError } from 'commander';
import { DateTime } from 'luxon';

import { writeFile } from 'fs/promises';
import Container, { Config, Logger } from '../../src/services';
import getClient from './elastic.util';
import { getDaysAsIso, getRandomInt } from '../../src/utils';

const MAX_OCCURENCES_PER_DAY = 30;
const IDP_LIST = ['fip1', 'fip2', 'fip3'];

const OUTPUT_JSON_PATH = 'tests/fixtures/output';

function transformDate(value) {
  const date = DateTime.fromISO(value, { zone: 'utc' });

  if (!date.isValid) {
    throw new InvalidOptionArgumentError(date.invalidExplanation);
  }
  return date;
}

class SimulateFsStats {
  constructor(container) {
    this.container = container;
    this.log = this.container.get('logger');
    this.esClient = null;
  }

  async removeOldValues() {
    const query = {
      refresh: true,
      index: 'franceconnect',
      body: {
        query: {
          match: {
            id: 'test-fs',
          },
        },
      },
    };
    this.esClient.deleteByQuery(query);
  }

  async indexDocs(list) {
    const header = {
      index: { _index: 'franceconnect' },
    };
    const bulk = list.map(doc => [header, doc]).flat();
    await this.esClient.bulk({ refresh: true, body: bulk });
  }

  async saveToDocs(client, list) {
    const output = list.map(data => JSON.stringify(data)).join('\n');
    const path = `${OUTPUT_JSON_PATH}/${client}-mock.logs`;
    this.log.info(`> Write JSON data ${path} with ${list.length} data`);
    await writeFile(path, output);
  }

  // eslint-disable-next-line class-methods-use-this
  buildDocuments(client, dates) {
    const allInsert = dates
      .map(date => {
        const entries = getRandomInt(MAX_OCCURENCES_PER_DAY, 0);
        return Array.from({ length: entries }, (_no, i) => ({
          // to track fake data
          id: 'test-fs',
          accountId: 'NO_USER_STATS',
          identityHash: `${i}`,
          action: 'authentication',
          // Required to find Sp
          fs_label: client,
          type_action: i % 2 !== 0 ? 'initial' : 'newAuthenticationQuery',
          // Required for time aggs
          time: date,
          // Required for Idp Graph
          fi: IDP_LIST[i % IDP_LIST.length],
        }));
      })
      .flat();

    return allInsert;
  }

  generateDates(start, stop) {
    const allDays = getDaysAsIso(start, stop);
    const first = allDays[0];
    const last = allDays[allDays.length - 1];
    this.log.info(`> Build fake data in interval: ${first}:${last}`);
    return allDays;
  }

  /**
   *
   * @param {string} client
   * @param {Datetime} start
   * @param {DateTime} stop
   */
  async injectConnection({ clientName, start, stop, json }) {
    this.log.info('> remove previous test data');
    await this.removeOldValues();
    this.log.info('> generate Date from time interval');
    const dates = this.generateDates(start, stop);
    this.log.info('> build fake entries for user connexion');
    const allInsert = this.buildDocuments(clientName, dates);
    this.log.info('> insert fake entries in ES');
    if (json) {
      this.saveToDocs(clientName, allInsert);
      this.log.info(`> fake entries save as JSON done : ${allInsert.length}`);
    } else {
      this.indexDocs(allInsert);
      this.log.info(`> fake entries in ES done : ${allInsert.length}`);
    }
  }

  async configure() {
    this.esClient = await getClient();
  }

  async run(options) {
    const { clientName, start, stop, json } = options;
    this.log.info(
      `Call process with ${clientName}, ${start}, ${stop}, ${json}`
    );
    try {
      this.log.info('Inject User Connections');

      await this.injectConnection({ clientName, start, stop, json });

      this.log.info('All done');
    } catch (e) {
      this.log.error(e);
      process.exit(1);
    }
  }
}

/**
 * PROGRAM
 */

const program = new Command();

program
  .name('SimulateFsStats')
  .description('add new connexion event to specific service provider')
  .version('1.0.0');

program.requiredOption(
  '-c, --clientName <string>',
  'the client name to target (ex: "my super Service Provider")'
);
program.requiredOption(
  '-st, --start <string>',
  'the start date to simulate',
  transformDate
);
program.requiredOption(
  '-sp, --stop <string>',
  'the stop date to simulate',
  transformDate
);
program.option('--json', 'force to output as json and not in database', false);

const container = new Container();

container.add('logger', () => new Logger());
container.add('config', () => new Config(process.env));

async function main() {
  program.parse();

  const options = program.opts();
  const job = new SimulateFsStats(container);
  try {
    await job.configure();
    await job.run(options);
  } catch (e) {
    job.log.error(e);
  }
}

main();
