/* eslint-disable class-methods-use-this */
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

  async getByIntervalByFIFS(start, stop, interval, size, after) {
    const api = this.container.get('logApi');
    const query = queries.getByIntervalByFIFS({
      start,
      stop,
      interval,
      size,
      after,
    });

    return api.search(query);
  }

  async getTotalForActionsAndFiAndRangeByWeek(fi, start, stop) {
    const api = this.container.get('logApi');
    const query = queries.getTotalForActionsAndFiAndRangeByWeek({
      fi,
      start,
      stop,
    });
    const data = await api.search(query);

    return data.body.aggregations.week.buckets.map(week => ({
      startDate: week.key,
      events: week.action.buckets.map(event => ({
        label: event.key,
        count: event.count.value,
      })),
    }));
  }

  async getActiveAccountsByRange(params) {
    const api = this.container.get('logApi');
    const stop = this.getStopDateForRange(params);
    const query = queries.getActiveAccount({ ...params, stop });
    const data = await api.search(query);

    return data.body.aggregations.activeUsers.value;
  }

  async getUsageCountsByRange(params) {
    const api = this.container.get('logApi');
    const stop = this.getStopDateForRange(params);
    const query = queries.getUsageCountsByRange({ ...params, stop });
    return api.search(query, { asStream: true });
    // const data = await api.search(query);
    // return data.body.aggregations.accounts;
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
    idFunction,
    transform = doc => doc
  ) {
    const entries = [];

    documents.forEach(doc => {
      entries.push({
        [operation]: { _index: index, _id: idFunction(doc) },
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

  async index(doc, index, id) {
    /* Temp Workarround !
       I can't figure out how to use elasticClient.index() method,
       there seems to be no more doc associated with our version.

       Let's makke this work anyway by using bulk api for our only doc.
    */
    return this.executeBulkQuery(
      this.createBulkQuery([doc], 'index', index, () => id)
    );
  }
}

export default Stats;
