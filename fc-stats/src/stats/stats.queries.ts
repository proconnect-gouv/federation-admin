import { Injectable } from '@nestjs/common';
import { SearchParams } from 'elasticsearch';
import { StatsServiceParams } from './interfaces/stats-service-params.interface';

@Injectable()
export class StatsQueries {
  getEvents(params: StatsServiceParams): SearchParams {
    const { start, stop } = params;
    const index = 'stats';
    const type = 'entry';

    const query = {
      index,
      size: 100,
      body: {
        sort: [
          { date: { order: 'asc' } },
          { fi: { order: 'asc' } },
          { fs: { order: 'asc' } },
          { typeAction: { order: 'asc' } },
          { action: { order: 'asc' } },
        ],
        query: {
          bool: {
            must: [
              { term: { _type: type } },
              {
                range: {
                  date: {
                    gte: start.getTime(),
                    lte: stop.getTime(),
                  },
                },
              },
            ],
          },
        },
      },
    };

    return query;
  }

  getTotalByActionAndRange(params: StatsServiceParams): SearchParams {
    const { action, start, stop } = params;
    const index = 'stats';
    const type = 'entry';

    const query = {
      index,
      size: 0,
      body: {
        query: {
          bool: {
            must: [
              { term: { action } },
              { term: { _type: type } },
              {
                range: {
                  date: {
                    gte: start.getTime(),
                    lte: stop.getTime(),
                  },
                },
              },
            ],
          },
        },
        aggs: {
          [action]: {
            sum: {
              field: 'count',
            },
          },
        },
      },
    };

    return query;
  }

  getTotalForActionsAndFiAndRangeByWeek(
    params: StatsServiceParams,
  ): SearchParams {
    const { fi, start, stop } = params;
    const index = 'stats';
    const type = 'entry';

    const query = {
      index,
      size: 0,
      body: {
        query: {
          bool: {
            must: [
              { term: { fi } },
              { term: { _type: type } },
              {
                range: {
                  date: {
                    gte: start.getTime(),
                    lte: stop.getTime(),
                  },
                },
              },
            ],
          },
        },
        aggs: {
          week: {
            date_histogram: {
              field: 'date',
              interval: 'week',
              min_doc_count: 0,
              extended_bounds: {
                min: start.getTime(),
                max: stop.getTime(),
              },
            },
            aggs: {
              action: {
                terms: {
                  field: 'typeAction',
                  size: 0,
                },
                aggs: {
                  count: {
                    sum: {
                      field: 'count',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    return query;
  }
}
