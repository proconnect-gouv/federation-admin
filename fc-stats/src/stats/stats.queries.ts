import { Injectable } from '@nestjs/common';
import { SearchParams } from 'elasticsearch';
import { StatsServiceParams } from './interfaces/stats-service-params.interface';

@Injectable()
export class StatsQueries {
  pushFilterValue(filters, key, value) {
    // Get existing filter
    const filter = filters.find(
      item => item.terms && typeof item.terms[key] !== 'undefined',
    );
    if (filter) {
      // And append value
      filter.terms[key].push(value);
    } else {
      // Or create a new filter
      filters.push({ terms: { [key]: [value] } });
    }
  }

  createMustQueryParam(params: StatsServiceParams) {
    const { filters, start, stop } = params;

    // Apply base mandatory params
    const must = [
      {
        term: { _type: 'entry' },
      },
      {
        range: {
          date: {
            gte: start.getTime(),
            lte: stop.getTime(),
          },
        },
      },
    ];

    // Apply all filters
    if (filters) {
      filters.forEach(filter =>
        this.pushFilterValue(must, filter.key, filter.value),
      );
    }

    return must;
  }

  streamEvents(params: StatsServiceParams): SearchParams {
    const index = 'stats';
    const must = this.createMustQueryParam(params);

    const query = {
      index,
      scroll: '10s',
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
            must,
          },
        },
      },
    };

    return query;
  }

  getEvents(params: StatsServiceParams): SearchParams {
    const { page, limit } = params;
    const index = 'stats';

    const must = this.createMustQueryParam(params);

    const query = {
      index,
      from: page,
      size: limit,
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
            must,
          },
        },
        aggs: {
          fi: {
            terms: {
              field: 'fi',
              size: 0,
              min_doc_count: 0,
              order: { _term: 'asc' },
            },
          },
          fs: {
            terms: {
              field: 'fs',
              size: 0,
              min_doc_count: 0,
              order: { _term: 'asc' },
            },
          },
          typeAction: {
            terms: {
              field: 'typeAction',
              size: 0,
              min_doc_count: 0,
              order: { _term: 'asc' },
            },
          },
          action: {
            terms: {
              field: 'action',
              size: 0,
              min_doc_count: 0,
              order: { _term: 'asc' },
            },
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
