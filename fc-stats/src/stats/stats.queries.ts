import { Injectable } from '@nestjs/common';
import { SearchParams } from 'elasticsearch';
import { StatsServiceParams } from './interfaces/stats-service-params.interface';
import { FilterParamDTO } from './dto/filter-param.dto';
import { fstat } from 'fs';

@Injectable()
export class StatsQueries {
  createMustQueryParam(elements: any[], params: StatsServiceParams) {
    const filters = [];
    const { start, stop } = params;
    const termsFSFilter = { fs: [] };
    const termsFiFilter = { fi: [] };
    const termsActionFilter = { action: [] };
    const termsTypeActionFilter = { typeAction: [] };
    const fs = (termsFSFilter.fs = []);
    const fi = (termsFiFilter.fi = []);
    const action = (termsActionFilter.action = []);
    const typeAction = (termsTypeActionFilter.typeAction = []);
    const range = {
      range: {
        date: {
          gte: start.getTime(),
          lte: stop.getTime(),
        },
      },
    };
    const must = [];

    /** Get filters in url */
    for (const [key, value] of Object.entries(params.filters)) {
      filters.push(value);
    }
    /**
     * Get filters values
     * Build all terms parts of the query
     * for the must obect
     */
    filters.forEach(element => {
      switch (element.key) {
        case 'fs':
          fs.push(element.value);
          const termsFS = { terms: termsFSFilter };
          must.push(termsFS);
          break;
        case 'fi':
          fi.push(element.value);
          const termsFI = { terms: termsFiFilter };
          must.push(termsFI);
          break;
        case 'action':
          action.push(element.value);
          const termsAction = { terms: termsActionFilter };
          must.push(termsAction);
          break;
        case 'typeAction':
          typeAction.push(element.value);
          const termsTypeAction = { terms: termsTypeActionFilter };
          must.push(termsTypeAction);
          break;
        default:
          break;
      }
    });
    /** Build last must part of the query */
    must.push(range);

    return must;
  }

  getEvents(params: StatsServiceParams): SearchParams {
    const elements: FilterParamDTO[] = [];
    const { start, stop } = params;
    const index = 'stats';
    const type = 'entry';
    let query = {};

    if (params.filters) {
      for (const key in params.filters) {
        if (params.filters.hasOwnProperty(key)) {
          elements[key] = params.filters[key];
        }
      }
      const must = this.createMustQueryParam(elements, params);
      /** Query to search if filter params */
      return (query = {
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
              must,
            },
          },
          aggs: {
            fi: {
              terms: {
                field: 'fi',
                size: 0,
              },
            },
            fs: {
              terms: {
                field: 'fs',
                size: 0,
              },
            },
            typeAction: {
              terms: {
                field: 'typeAction',
                size: 0,
              },
            },
            action: {
              terms: {
                field: 'action',
                size: 0,
              },
            },
          },
        },
      });
    } else {
      /** Default query */
      return (query = {
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
          aggs: {
            fi: {
              terms: {
                field: 'fi',
                size: 0,
              },
            },
            fs: {
              terms: {
                field: 'fs',
                size: 0,
              },
            },
            typeAction: {
              terms: {
                field: 'typeAction',
                size: 0,
              },
            },
            action: {
              terms: {
                field: 'action',
                size: 0,
              },
            },
          },
        },
      });
    }
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
