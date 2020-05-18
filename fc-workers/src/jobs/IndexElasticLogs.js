import crypto from 'crypto';
import _ from 'lodash';
import Job from './Job';

class IndexElasticLogs extends Job {
  static usage() {
    return `
      Usage:
      > IndexElasticLogs --start=<YYYY-MM-DD> --stop=<YYYY-MM-DD>
    `;
  }

  /**
   Handling data source
  */
  async fetchData(start, stop, size, after = null) {
    const statsService = this.container.get('stats');
    return statsService.getByIntervalByFIFS(start, stop, 'day', size, after);
  }

  static getKey(entry) {
    const { date, action, typeAction, fs, fi } = entry;

    return crypto
      .createHash('sha256')
      .update([date, action, typeAction, fs, fi].join('.'))
      .digest('hex');
  }

  async createDocuments(docList, chunkLength, timePerRequest, delay) {
    const statsService = this.container.get('stats');
    const chunks = _.chunk(docList, chunkLength);

    const queries = chunks.map(chunk =>
      statsService.createBulkQuery(
        chunk,
        'index',
        'events',
        doc => doc.id,
        IndexElasticLogs.formatDocument
      )
    );

    const promises = queries.map((query, index) => {
      const timeout = delay + timePerRequest * index;
      return new Promise(res => {
        setTimeout(() => {
          res(statsService.executeBulkQuery(query));
        }, timeout);
      });
    });

    return Promise.all(promises);
  }

  static getIndexationStats(indexationResults) {
    const reducer = (acc, result) => acc + result.body.items.length;

    return indexationResults.reduce(reducer, 0);
  }

  /**
     Compute control stats
    */
  static getEventCountFromAggregates(documents) {
    const reducer = (acc, doc) => acc + doc.count;

    return documents.reduce(reducer, 0);
  }

  async indexLogs(start, stop, after = null, initialDelay = 0) {
    this.log.info('Fetch the value we want from ES');
    const compositeSize = 10000;
    const data = await this.fetchData(start, stop, compositeSize, after);
    const { buckets, after_key: nextAfter } = data.body.aggregations.date;

    const docList = buckets.map(bucket => ({
      ...bucket.key,
      id: IndexElasticLogs.getKey(bucket.key),
      count: bucket.doc_count,
    }));

    this.log.info('Build an array of documents');

    const eventCount = IndexElasticLogs.getEventCountFromAggregates(docList);
    const totalCount = IndexElasticLogs.getEventCountFromAggregates(
      buckets.map(doc => ({ ...doc, count: doc.doc_count }))
    );

    this.log.info(`   > Created ${docList.length} documents
     with ${eventCount} events
     from ${totalCount} original events`);

    this.log.info('Post new entries to stats index');

    const chunkSize = 1000;
    const timePerRequest = 100;
    const delay = Math.floor(
      ((docList.length / chunkSize) * timePerRequest) / 1000
    );
    this.log.info(
      `   > This will take at least ${delay} seconds, please hold on...`
    );
    const results = await this.createDocuments(
      docList,
      chunkSize,
      timePerRequest,
      initialDelay
    );

    this.log.info(
      `   > created ${IndexElasticLogs.getIndexationStats(results)} documents`
    );

    if (nextAfter) {
      this.log.info('ES indcated more results doing another loop...');
      this.log.info(
        'There is usually an empty one at the end, this is "normal"'
      );
      this.indexLogs(start, stop, nextAfter, delay + initialDelay);
    }
  }

  async run(params) {
    this.log.info('Input control');
    const input = this.container.get('input');
    const schema = {
      start: { type: 'date', mandatory: true },
      stop: { type: 'date', mandatory: true },
    };

    const { start, stop } = input.get(schema, params);

    this.indexLogs(start, stop);

    this.log.info('All done');
  }
}

IndexElasticLogs.description =
  'Aggregate events from logs and index them in stats elastic';

export default IndexElasticLogs;
