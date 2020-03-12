import { Test } from '@nestjs/testing';
import { StatsQueries } from './stats.queries';

describe('StatsQueries', () => {
  const START_DATE = new Date('2019-05-01');
  const STOP_DATE = new Date('2019-07-01');
  const STOP_DATE_PLUS_ONE = new Date('2019-07-02');

  let statsQueries: StatsQueries;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [StatsQueries],
    }).compile();

    statsQueries = await module.get<StatsQueries>(StatsQueries);
  });

  describe('pushFilterValue', () => {
    it('Should return a new filter term query', () => {
      // Given
      const filters = [];
      const key = 'foo';
      const value = 'bar';
      // When
      statsQueries.pushFilterValue(filters, key, value);
      // Then
      expect(filters).toHaveLength(1);
      expect(filters).toEqual([{ terms: { foo: ['bar'] } }]);
    });
    it('Should append values to existing filter term query', () => {
      // Given
      const filters = [];
      const key = 'foo';
      const value1 = 'bar';
      const value2 = 'baz';
      // When
      statsQueries.pushFilterValue(filters, key, value1);
      statsQueries.pushFilterValue(filters, key, value2);
      // Then
      expect(filters).toHaveLength(1);
      expect(filters).toEqual([{ terms: { foo: ['bar', 'baz'] } }]);
    });
    it('Should append filters', () => {
      // Given
      const filters = [];
      const key1 = 'foo';
      const value1 = 'bar';
      const value2 = 'baz';
      const key2 = 'wizz';
      const value3 = 'fizz';
      const value4 = 'buzz';
      // When
      statsQueries.pushFilterValue(filters, key1, value1);
      statsQueries.pushFilterValue(filters, key1, value2);
      statsQueries.pushFilterValue(filters, key2, value3);
      statsQueries.pushFilterValue(filters, key2, value4);
      // Then
      expect(filters).toHaveLength(2);
      expect(filters).toEqual([
        { terms: { foo: ['bar', 'baz'] } },
        { terms: { wizz: ['fizz', 'buzz'] } },
      ]);
    });
  });

  describe('streamEvents', () => {
    it('Should return a query', () => {
      // Given
      const params = {
        start: START_DATE,
        stop: STOP_DATE,
        columns: ['fi', 'fs', 'action', 'typeAction'],
      };
      // When
      const result = statsQueries.streamEvents(params);
      // Then
      expect(result).toBeDefined(), expect(result.index).toBe('events');
      expect(result.body.query.bool.must[0].range.date.gte).toBe(
        START_DATE.getTime(),
      );
      expect(result.body.query.bool.must[0].range.date.lte).toBe(
        STOP_DATE.getTime(),
      );
    });
  });

  describe('getEvents', () => {
    it('Should return a query', () => {
      // Given
      const params = {
        start: START_DATE,
        stop: STOP_DATE,
        columns: ['fi', 'fs', 'action', 'typeAction'],
      };
      // When
      const result = statsQueries.getEvents(params);
      // Then
      expect(result).toBeDefined(), expect(result.index).toBe('events');
      expect(result.body.query.bool.must[0].range.date.gte).toBe(
        START_DATE.getTime(),
      );
      expect(result.body.query.bool.must[0].range.date.lte).toBe(
        STOP_DATE.getTime(),
      );
    });

    it('Should return a query with aggregation', () => {
      // Given
      const params = {
        start: START_DATE,
        stop: STOP_DATE,
        columns: ['fi', 'fs', 'action', 'typeAction'],
      };
      // When
      const result = statsQueries.getEvents(params);

      // Then
      expect(result).toBeDefined(), expect(result.index).toBe('events');
      expect(result.body.aggs).toBeDefined();
      expect(result.body.aggs.date).toBeDefined();
      expect(result.body.aggs.fi).toBeDefined();
      expect(result.body.aggs.fs).toBeDefined();
      expect(result.body.aggs.action).toBeDefined();
      expect(result.body.aggs.typeAction).toBeDefined();
    });
  });

  describe('getMetrics', () => {
    it('Should limit the query to 1000 result for graph views', () => {
      // Given
      const params = {
        start: START_DATE,
        stop: STOP_DATE,
        columns: [],
        visualize: 'bar',
        limit: 20,
      };
      // When
      const result = statsQueries.getMetrics(params);
      // Then
      expect(result.size).toBe(1000);
    });

    it('Should limit the query to given limit for graph views', () => {
      // Given
      const params = {
        start: START_DATE,
        stop: STOP_DATE,
        columns: [],
        visualize: 'list',
        limit: 20,
      };
      // When
      const result = statsQueries.getMetrics(params);
      // Then
      expect(result.size).toBe(20);
    });
  });

  describe('generateGranularityAggregation', () => {
    it('Should generate aggregation according to selected columns', () => {
      // Given
      const params = {
        start: START_DATE,
        stop: STOP_DATE,
        columns: ['fi', 'typeAction'],
        granularity: 'day',
      };
      // When
      const result = statsQueries.generateGranularityAggregation(params);
      // Then
      expect(result).toEqual({
        date_histogram: {
          field: 'date',
          interval: 'day',
        },
        aggs: {
          fi: {
            terms: {
              field: 'fi',
              min_doc_count: 1,
              order: { _term: 'asc' },
              size: 1000,
            },
            aggs: {
              typeAction: {
                terms: {
                  field: 'typeAction',
                  min_doc_count: 1,
                  order: { _term: 'asc' },
                  size: 1000,
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
      });
    });
    it('Should generate a date_range aggregation if granularity is "all data"', () => {
      // Given
      const params = {
        start: START_DATE,
        stop: STOP_DATE,
        columns: ['fi', 'typeAction'],
        granularity: 'all',
      };
      // When
      const result = statsQueries.generateGranularityAggregation(params);
      // Then
      expect(result).toEqual({
        date_range: {
          field: 'date',
          ranges: [{ from: START_DATE, to: STOP_DATE_PLUS_ONE }],
        },
        aggs: {
          fi: {
            terms: {
              field: 'fi',
              min_doc_count: 1,
              order: { _term: 'asc' },
              size: 1000,
            },
            aggs: {
              typeAction: {
                terms: {
                  field: 'typeAction',
                  min_doc_count: 1,
                  order: { _term: 'asc' },
                  size: 1000,
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
      });
    });
  });
});
