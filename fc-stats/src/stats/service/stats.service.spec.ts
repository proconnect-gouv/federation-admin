import { Stream } from 'stream';
import { Test } from '@nestjs/testing';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { StatsService } from './stats.service';
import { StatsQueries } from '../stats.queries';
import { aggregations } from '../../../fixtures/aggregation';
import { MetricDTO } from '../dto/metric.dto';

describe('StatsService', () => {
  let statsService: StatsService;
  const search = jest.fn();
  const elasticsearchService = {
    getClient: () => ({ search }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ElasticsearchModule.register({
          host: 'localhost:9200',
          log: 'trace',
        }),
      ],
      providers: [StatsService, StatsQueries],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchService)
      .compile();
    statsService = await module.get<StatsService>(StatsService);
    jest.resetAllMocks();
  });

  describe('streamEvents', () => {
    it('Should return a stream', () => {
      // Given
      const params = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
      };
      const elasticResponse = {
        hits: {
          hits: [
            {
              _index: 'stats',
              _type: 'entry',
              _id: 'foo',
              _score: 1.42,
              _source: {
                fs: 'foo',
                fi: 'bar',
                count: 2,
                typeAction: 'fizz',
                action: 'buzz',
                date: new Date('2019-03-01'),
              },
            },
          ],
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = statsService.streamEvents(params);
      // Then
      expect(result).toBeDefined();
      expect(result instanceof Stream).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('Should call es service with only range query params', async () => {
      // Given
      const params = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
        columns: ['key', 'range'],
      };
      const elasticResponse = {
        hits: {
          hits: [
            {
              _source: {
                key: 'foo',
                value: 42,
                range: 'day',
                date: new Date('2019-03-01'),
              },
            },
          ],
        },
        aggregations: {
          key: {
            buckets: [],
          },
          range: {
            buckets: [],
          },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsService.getMetrics(params);
      // Then
      expect(result).toBeDefined();
      expect(result instanceof Object).toBe(true);
      expect(search.mock.calls).toHaveLength(1);

      const { stats } = result;
      expect(Array.isArray(stats)).toBe(true);
      expect(stats).toHaveLength(1);
      expect(stats[0] instanceof MetricDTO).toBe(true);
      expect(result.meta).toBeDefined();
    });
  });

  describe('getEvents', () => {
    it('Should call es service wih only range query params', async () => {
      // Given
      const params = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
      };
      const elasticResponse = {
        hits: {
          hits: [
            {
              _index: 'stats',
              _type: 'entry',
              _id: 'foo',
              _score: 1.42,
              _source: {
                fs: 'foo',
                fi: 'bar',
                count: 2,
                typeAction: 'fizz',
                action: 'buzz',
                date: new Date('2019-03-01'),
              },
            },
          ],
        },
        aggregations: {
          date: aggregations.date,
          fi: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
          fs: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
          action: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
          typeAction: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsService.getEvents(params);
      // Then
      expect(result).toBeDefined();
      expect(result instanceof Object).toBe(true);
      expect(search.mock.calls).toHaveLength(1);
    });

    it('call es service wih range and filter query params', async () => {
      // Given
      const params = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
        filter: [{ key: 'fi', value: 'dgfip' }],
      };
      const elasticResponse = {
        hits: {
          hits: [
            {
              _index: 'stats',
              _type: 'entry',
              _id: 'foo',
              _score: 1.42,
              _source: {
                fs: 'foo',
                fi: 'bar',
                count: 2,
                typeAction: 'fizz',
                action: 'buzz',
                date: new Date('2019-03-01'),
              },
            },
          ],
        },
        aggregations: {
          date: aggregations.date,
          fi: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
          fs: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
          action: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
          typeAction: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsService.getEvents(params);
      // Then
      expect(result).toBeDefined();
      expect(result instanceof Object).toBe(true);
      expect(search.mock.calls).toHaveLength(1);
    });
  });

  describe('aggregationsToDocuments', () => {
    it('Should return flatten documents', () => {
      // Given
      const params = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-01-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
      };
      const aggs = aggregations;
      // When
      const result = StatsService.aggregationsToDocuments(params, aggs);
      // Then
      expect(Array.isArray(result)).toBeTruthy();
    });
  });
});
