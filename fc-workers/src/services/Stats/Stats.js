/* eslint-disable class-methods-use-this */
import moment from 'moment';
import { METRICS_INDEX, EVENTS_INDEX, FRANCECONNECT_INDEX } from './base';
import * as queries from './queries';

class Stats {
  constructor(container) {
    this.container = container;
    this.dataApi = this.container.get('dataApi');
    this.logApi = this.container.get('logApi');
    this.inputs = this.container.get('input');
    this.config = this.container.get('config');
  }

  addIndex(query, nameIndex = FRANCECONNECT_INDEX) {
    let index;
    switch (nameIndex) {
      case EVENTS_INDEX:
        index = this.config.getElasticEventsIndex();
        break;
      case METRICS_INDEX:
        index = this.config.getElasticMetricsIndex();
        break;
      default:
        index = this.config.getElasticMainIndex();
        break;
    }
    return {
      ...query,
      index,
    };
  }

  async getIdsToDelete(params) {
    const { from, size } = params;
    const rawQuery = queries.getIdsToDelete(params);
    const query = this.addIndex(rawQuery);
    const data = await this.dataApi.search(query);

    const { total, hits } = data.hits;

    const ids = hits.map(({ _id: id }) => id);

    return { from, size, total, ids };
  }

  async getByIntervalByFIFS(start, stop, interval, size, after) {
    const rawQuery = queries.getByIntervalByFIFS({
      start,
      stop,
      interval,
      size,
      after,
    });

    const query = this.addIndex(rawQuery);

    return this.logApi.search(query);
  }

  async getTotalForActionsAndFiAndRangeByWeek(fi, start, stop) {
    const rawQuery = queries.getTotalForActionsAndFiAndRangeByWeek({
      fi,
      start,
      stop,
    });

    const query = this.addIndex(rawQuery, EVENTS_INDEX);

    const data = await this.logApi.search(query);

    return data.body.aggregations.week.buckets.map(week => ({
      startDate: week.key,
      events: week.action.buckets.map(event => ({
        label: event.key,
        count: event.count.value,
      })),
    }));
  }

  async getActiveAccountsByRange(params) {
    const stop = this.getStopDateForRange(params);
    const rawQuery = queries.getActiveAccount({ ...params, stop });

    const query = this.addIndex(rawQuery);
    const data = await this.logApi.search(query);

    return data.body.aggregations.activeUsers.value;
  }

  async getUsageCountsByRange(params) {
    const stop = this.getStopDateForRange(params);
    const rawQuery = queries.getUsageCountsByRange({ ...params, stop });

    const query = this.addIndex(rawQuery);

    return this.logApi.search(query, { asStream: true });
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
    const schema = {
      key: { type: 'string', mandatory: true },
      value: { type: 'number', mandatory: true },
      date: { type: 'date', mandatory: true },
      range: { type: 'timeRange', mandatory: false },
    };
    const { key, value, date, range } = this.inputs.get(schema, params);

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
    const body = Stats.stringifyQuery(query);
    return this.dataApi.bulk({ body });
  }

  async index(doc, index, id) {
    /* Temp Workarround !
       I can't figure out how to use elasticClient.index() method,
       there seems to be no more doc associated with our version.

       Let's make this work anyway by using bulk api for our only doc.
    */
    return this.executeBulkQuery(
      this.createBulkQuery([doc], 'index', index, () => id)
    );
  }
}

export default Stats;
