import crypto from 'crypto';
import Job from './Job';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Can't get the data easily with current index
 * @see https://discuss.elastic.co/t/how-to-aggregate-by-doc-count/212106/2
 */

class IndexFrequency extends Job {
  static usage() {
    return `
        Usage:
        > IndexFrequency --start=<<YYYY-MM-DD>> --range=<day|week|month|year> --wait=<ms> --buckets=<size>
        `;
  }

  async fetchData(start, range, buckets, after) {
    const stats = this.container.get('stats');

    return stats.getUsageCountsByRange({ start, range, buckets, after });
  }

  static removeHeader(data) {
    const pattern = 'buckets":[';
    const index = data.indexOf(pattern);

    if (index > -1) {
      console.log('Found header');
      return data.substring(index + pattern.length, data.length);
    }
    console.log('No header found');
    return data;
  }

  static getAfterKey(data) {
    const pattern = `{"after_key":({"sub":"[^"}]+"})`;
    const reg = RegExp(pattern);

    const result = reg.exec(data);

    if (result) {
      return JSON.parse(result[1]);
    }
  }

  static extractDoc(data) {
    const patternLength = 2;
    const nextClosing = /[0-9]}/;
    const comaLength = 1;

    const objectEndOffset = data.search(nextClosing);

    if (objectEndOffset > -1) {
      const objectString = data.substring(0, objectEndOffset + patternLength);

      try {
        const doc = JSON.parse(objectString);
        const newData = data.substring(
          objectEndOffset + patternLength + comaLength,
          data.length
        );

        return { data: newData, doc };
      } catch (error) {
        console.error(error);
        return { data, doc: false };
      }
    }

    return { data, doc: false };
  }

  async computeOne(
    start,
    range,
    wait,
    bucketsCount,
    accumulator,
    after = null
  ) {
    return new Promise(async (resolve, reject) => {
      let data = '';
      let afterKey = null;

      const { body } = await this.fetchData(start, range, bucketsCount, after);
      body.setEncoding('utf8');

      body.on('data', rawChunk => {
        const chunk = IndexFrequency.removeHeader(rawChunk);
        if (!afterKey) {
          afterKey = IndexFrequency.getAfterKey(rawChunk);
        }

        data += chunk;

        let parsing;
        let doc;

        do {
          parsing = IndexFrequency.extractDoc(data);

          data = parsing.data;
          doc = parsing.doc;

          if (doc) {
            if (!doc.doc_count) {
              console.log('????', doc);
            }
            const { doc_count: count } = doc;

            if (!accumulator[count]) {
              accumulator[count] = 0;
            }

            accumulator[count] += 1;
          }
        } while (doc !== false);
      });

      body.on('end', async () => {
        await sleep(wait);
        resolve(afterKey);
      });
    });

    // const { buckets, after_key: nextAfter } = await this.fetchData(
    //   start,
    //   range,
    //   bucketsCount,
    //   after
    // );
    // buckets.forEach(({ doc_count: count }) => {
    //   if (!accumulator[count]) {
    //     accumulator[count] = 0;
    //   }

    //   accumulator[count] += 1;
    // });

    // this.log.info(`${Math.ceil(process.memoryUsage().rss / 1048576)}Mb`);

    // return nextAfter;
  }

  async computeAllData(start, range, wait, buckets, accumulator) {
    let nextAfter = false;
    do {
      this.log.info('Compute one');
      nextAfter = await this.computeOne(
        start,
        range,
        wait,
        buckets,
        accumulator,
        nextAfter
      );
    } while (nextAfter);
  }

  static getFrequencyName(frequency) {
    return `loggedTimes_${frequency}`;
  }

  static getMetricId(metric) {
    const { key, date, range } = metric;

    return crypto
      .createHash('sha256')
      .update([key, date, range].join('.'))
      .digest('hex');
  }

  async createMetrics(data, date, range) {
    const stats = this.container.get('stats');

    Object.entries(data).forEach(async ([frequency, value]) => {
      const doc = stats.createMetricDocument({
        key: IndexFrequency.getFrequencyName(frequency),
        value,
        date,
        range,
      });

      // this.log.info('Create a unique consistant id for idempotence');
      const id = IndexFrequency.getMetricId(doc);

      // this.log.info('Save document to index');

      await stats.index(doc, 'metrics', id);
    });

    this.log.info('All done');
  }

  async run(params) {
    const { input } = this.container.get(['input', 'stats']);

    this.log.info('Input control');
    const schema = {
      start: { type: 'date', mandatory: true },
      range: { type: 'timeRange', mandatory: true },
      wait: { type: 'number', mandatory: true },
      buckets: { type: 'number', mandatory: true },
    };

    const { start, range, wait, buckets } = input.get(schema, params);

    this.log.info('Fecth data from logs');

    const accumulator = {};

    await this.computeAllData(start, range, wait, buckets, accumulator);

    this.log.info(JSON.stringify(accumulator, null, 2));

    this.createMetrics(accumulator, start, range);
  }
}

IndexFrequency.description =
  'Compute frequency statistics from elastic business logs';

export default IndexFrequency;
