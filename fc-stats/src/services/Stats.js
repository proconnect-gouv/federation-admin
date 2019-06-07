import { Stats as StatsModel } from '../repositories';

class Stats {
  constructor(model) {
    this.model = model;
  }

  async getTotalForAction(params) {
    const { start, stop, action } = params;
    const stats = new StatsModel(this.model);
    const data = await stats.getTotalByActionAndRange(params);
    const count = data.aggregations[action].value;

    return { start, stop, action, count };
  }

  async getTotalForActionsAndFiAndRangeByWeek(params) {
    const stats = new StatsModel(this.model);
    const data = await stats.getTotalForActionsAndFiAndRangeByWeek(params);

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
