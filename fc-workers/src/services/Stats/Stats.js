import moment from 'moment';
import * as queries from './queries';

class Stats {
  constructor(container) {
    this.container = container;
  }

  async getIdsToDelete(params) {
    const api = this.container.get('dataApi');
    const { from, size } = params;
    const query = queries.getIdsToDelete(params);
    const data = await api.search(query);

    const { total, hits } = data.hits;
    // elasticsearch native variable name
    // eslint-disable-next-line no-underscore-dangle
    const ids = hits.map(document => document._id);

    return { from, size, total, ids };
  }

  async getByIntervalByFIFS(start, stop, interval) {
    const api = this.container.get('logApi');
    const query = queries.getByIntervalByFIFS({ start, stop, interval });

    return api.search(query);
  }

  async getActiveAccountsByRange(params) {
    const api = this.container.get('logApi');
    params.stop = this.getStopDateForRange(params);
    const query = queries.getActiveAccount(params);

    const data = await api.search(query);

    return data.aggregations.activeUsers.value;
  }

  getStopDateForRange(params) {
    const { start, range } = params;

    return (
      moment(start)
        // Add given range
        .add(1, range)
        // Remove one day to get only wante period
        // ie. for 1 month we want 2018/01/01 to 2018/01/31, not to 2018/02/01
        .add(-1, 'day')
        // Return a native javascript object
        .toDate()
    );
  }

  createMetricDocument(params) {
    const input = this.container.get('input');

    const schema = {
      key: { type: 'string', mandatory: true },
      value: { type: 'number', mandatory: true },
      date: { type: 'date', mandatory: true },
      range: { type: 'timeRange', mandatory: false },
    };
    const { key, value, date, range } = input.get(schema, params);

    return {
      key,
      value,
      date: new Date(date).toISOString(),
      range,
    };
  }

  createBulkQuery(
    documents,
    operation,
    index,
    type,
    idFunction,
    transform = doc => doc
  ) {
    const entries = [];

    documents.forEach(doc => {
      entries.push({
        [operation]: { _index: index, _type: type, _id: idFunction(doc) },
      });
      entries.push(transform(doc));
    });

    return entries;
  }

  static stringifyQuery(query) {
    return query.reduce(
      (acc, current) => `${acc}${JSON.stringify(current)}\n`,
      ''
    );
  }

  async executeBulkQuery(query) {
    const api = this.container.get('dataApi');
    const body = Stats.stringifyQuery(query);
    return api.bulk({ body });
  }

  async index(doc, index, type, id) {
    /* Temp Workarround !
       I can't figure out how to use elasticClient.index() method,
       there seems to be no more doc associated with our version.

       Let's makke this work anyway by using bulk api for our only doc.
    */
    return this.executeBulkQuery(
      this.createBulkQuery([doc], 'index', index, type, () => id)
    );
  }
}

export default Stats;
