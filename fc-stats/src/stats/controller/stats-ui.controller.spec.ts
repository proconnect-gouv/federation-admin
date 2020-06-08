import { Test } from '@nestjs/testing';
import { StatsUIController } from './stats-ui.controller';
import { StatsService } from '../service/stats.service';
import { SummaryService } from '../service/sumary.service';
import { StatsQueries } from '../stats.queries';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { aggregations } from '../../../fixtures/aggregation';

describe('StatsUIController', () => {
  let statsController;
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
      providers: [StatsService, StatsQueries, SummaryService],
      controllers: [StatsUIController],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchService)
      .compile();

    statsController = module.get<StatsUIController>(StatsUIController);
    jest.resetAllMocks();
  });

  describe('getEvents', () => {
    it('Return only parameters if empty parameters are provided', async () => {
      // Given
      const mockQuery = {
        start: '',
        stop: '',
        columns: ['fs', 'fi', 'action', 'typeAction'],
      };
      // When
      const result = await statsController.getEvents(mockQuery);
      // Then
      expect(result).toEqual({ params: mockQuery });
    });

    it('Return only parameters if empty parameters and empty filter are provided', async () => {
      // Given
      const mockQuery = {
        start: '',
        stop: '',
        columns: ['fs', 'fi', 'action', 'typeAction'],
        filters: [{}],
      };
      // When
      const result = await statsController.getEvents(mockQuery);
      // Then
      expect(result).toEqual({ params: mockQuery });
    });

    it('Should return stats and meta data', async () => {
      // Given
      const mockQuery = {
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
      const result = await statsController.getEvents(mockQuery);
      // Then
      expect(result.stats).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it('Should return a filtered query', async () => {
      // Given
      const mockQuery = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
        filters: [{ key: 'fi', value: 'dgfip' }],
      };
      const elasticResponse = {
        hits: {
          hits: [],
        },
        aggregations: {
          date: aggregations.date,
          fi: { buckets: [] },
          fs: { buckets: [] },
          action: { buckets: [] },
          typeAction: { buckets: [] },
        },
      };

      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsController.getEvents(mockQuery);
      // Then
      expect(result.stats.length).toEqual(32);
      expect(result.stats[0].fi).toBe('ameli');
      expect(result.stats[1].fi).toBe('ameli');
    });

    it('Return empty object if no parameters are provided', async () => {
      // Given
      const mockQuery = {};
      // When
      const result = await statsController.getEvents(mockQuery);
      // Then
      expect(result).toEqual({ params: {} });
    });

    it('returns all the stats entries', async () => {
      // Given
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
            buckets: [],
          },
          fs: {
            buckets: [],
          },
          action: {
            buckets: [],
          },
          typeAction: {
            buckets: [],
          },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      const mockQuery = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
      };
      // When
      const result = await statsController.getEvents(mockQuery);
      // Then
      expect(result.params).toEqual(mockQuery);
      expect(Array.isArray(result.stats)).toBeTruthy();
      expect(result.meta).toBeDefined();
    });

    it('returns all the service providers', async () => {
      // Given
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
            buckets: [],
          },
          fs: {
            buckets: [],
          },
          action: {
            buckets: [],
          },
          typeAction: {
            buckets: [],
          },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      const mockQuery = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
      };
      // When
      const result = await statsController.getEvents(mockQuery);
      // Then
      expect(result.params).toEqual(mockQuery);
      expect(Array.isArray(result.stats)).toBeTruthy();
      expect(result.meta).toBeDefined();
    });
  });

  /////////////////////////////////////////////////

  describe('getMetrics', () => {
    it('Return only parameters if empty parameters are provided', async () => {
      // Given
      const mockQuery = {
        start: '',
        stop: '',
        columns: [],
      };
      // When
      const result = await statsController.getMetrics(mockQuery);
      // Then
      expect(result).toEqual({ params: mockQuery });
    });

    it('Return only parameters if empty parameters and empty filter are provided', async () => {
      // Given
      const mockQuery = {
        start: '',
        stop: '',
        columns: [],
        filters: [{}],
      };
      // When
      const result = await statsController.getMetrics(mockQuery);
      // Then
      expect(result).toEqual({ params: mockQuery });
    });

    it('Should return stats and meta data', async () => {
      // Given
      const mockQuery = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
      };
      const elasticResponse = {
        hits: {
          total: 1,
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
          key: { buckets: [] },
          range: { buckets: [] },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsController.getMetrics(mockQuery);
      // Then
      expect(result.stats).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it('Should return a filtered query', async () => {
      // Given
      const mockQuery = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
        columns: ['fs', 'fi', 'action', 'typeAction'],
        filters: [{ key: 'fi', value: 'dgfip' }],
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
          key: { buckets: [] },
          range: { buckets: [] },
        },
      };

      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsController.getMetrics(mockQuery);
      // Then
      expect(result.stats.length).toEqual(1);
      expect(result.stats[0]).toEqual({
        key: 'foo',
        value: 42,
        range: 'day',
        date: new Date('2019-03-01'),
      });
    });

    it('Return empty object if no parameters are provided', async () => {
      // Given
      const mockQuery = {};
      // When
      const result = await statsController.getMetrics(mockQuery);
      // Then
      expect(result).toEqual({ params: {} });
    });
  });
});
