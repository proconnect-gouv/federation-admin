import * as queries from './queries';

class Stats {
  constructor(dataApi) {
    this.dataApi = dataApi;
  }

  async getTotalForAction(params) {
    const { start, stop, action } = params;
    const query = queries.getTotalByActionAndRange(params);
    const data = await this.dataApi.search(query);
    const count = data.aggregations[action].value;

    return { start, stop, action, count };
  }

  async getTotalForActionsAndFiAndRangeByWeek(params) {
    const query = queries.getTotalForActionsAndFiAndRangeByWeek(params);
    const data = await this.dataApi.search(query);

    const result = { ...params };

    result.weeks = data.aggregations.week.buckets.map(week => ({
      startDate: week.key,
      events: week.action.buckets.map(event => ({
        label: event.key,
        count: event.count.value,
      })),
    }));

    return result;
  }
}

export default Stats;
