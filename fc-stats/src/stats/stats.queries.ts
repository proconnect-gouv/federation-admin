import { Injectable } from '@nestjs/common';
import { SearchParams } from 'elasticsearch';
import { StatsServiceParams } from './interfaces/stats-service-params.interface';

const METRIC_DOC_TYPE = 'metric';

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
    const index = 'events';
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

  /**
   * Simple template function for aggregation
   */
  private generateAggregation(field: string, minCount = 0) {
    return {
      terms: {
        field,
        min_doc_count: minCount,
        order: { _term: 'asc' },
        size: 1000,
      },
    };
  }

  /**
   * Simple template function for sort
   */
  private generateSort(field, order) {
    return { [field]: { order } };
  }

  /**
   * Generate imbricated aggregations according to user selected columns (properties)
   * This allow us to compute sums for given granularity (day, week, etc.)
   * like we would do with a `GROUP BY` clause in SQL.
   *
   * We will have to compute the resulting aggregations to mimic documents
   * when we receive the response, this is done in `StatsService.aggregationsToDocuments()`
   */
  generateGranularityAggregation(params) {
    const subAggregation: any = {};
    // currentColumn will be a pointer to our deepest aggregation
    // for the loop to come
    let currentColumn = subAggregation;

    params.columns.forEach(column => {
      // create an aggregation structure for curren column
      currentColumn[column] = this.generateAggregation(column, 1);
      // create an empty `aggs` object and make it our currentColumn
      // for next loop
      currentColumn = currentColumn[column].aggs = {};
    });

    // The last column should receive a sum aggregation
    // to actually count the values
    currentColumn.count = { sum: { field: 'count' } };

    if (params.granularity === 'all') {
      // Return a single period aggregation for the given date range

      // `to` is excluded from range so we add 1 day
      const to = new Date(params.stop);
      to.setDate(to.getDate() + 1);

      return {
        date_range: {
          field: 'date',
          ranges: [{ from: params.start, to }],
        },
        aggs: subAggregation,
      };
    }

    // Or return a `date_histogram` based on user chosen granularity
    return {
      date_histogram: {
        field: 'date',
        interval: params.granularity,
      },
      aggs: subAggregation,
    };
  }

  getEvents(params: StatsServiceParams): SearchParams {
    const query = {
      index: 'events',
      // We do not use the documents as result
      size: 0,
      body: {
        sort: [
          // No user defined sort feature in the UI for now
          this.generateSort('date', 'asc'),
          this.generateSort('fi', 'asc'),
          this.generateSort('fs', 'asc'),
          this.generateSort('fs_label.keyword', 'asc'),
          this.generateSort('typeAction', 'asc'),
          this.generateSort('action', 'asc'),
        ],
        query: {
          bool: {
            // Main query
            must: this.createMustQueryParam(params),
          },
        },
        aggs: {
          // Main imbricated aggregation to build the results
          date: this.generateGranularityAggregation(params),

          // Side aggregations to list availables values for filters in UI
          fi: this.generateAggregation('fi'),
          fs: this.generateAggregation('fs'),
          fsLabel: this.generateAggregation('fs_label.keyword'),
          typeAction: this.generateAggregation('typeAction', 1),
          action: this.generateAggregation('action'),
        },
      },
    };

    return query;
  }

  getMetrics(params: StatsServiceParams): SearchParams {
    const { visualize, page, limit } = params;

    const query = {
      index: 'metrics',
      from: page,
      size: visualize === 'list' ? limit : 1000,
      body: {
        sort: [
          this.generateSort('date', 'asc'),
          this.generateSort('key', 'asc'),
          this.generateSort('range', 'asc'),
        ],
        query: {
          bool: {
            must: this.createMustQueryParam(params),
          },
        },
        aggs: {
          key: this.generateAggregation('key'),
          range: this.generateAggregation('range'),
        },
      },
    };

    return query;
  }
}
