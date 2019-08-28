import { Stream } from 'stream';
import { Test } from '@nestjs/testing';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { StatsService } from './stats.service';
import { StatsQueries } from '../stats.queries';
import { StatsDTO } from '../dto/stats.dto';
import { StatsUIListOutputDTO } from '../dto/stats-ui-list-output.dto';
import { MetaDTO } from '../dto/meta.dto';

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

  describe('getEvents', () => {
    it('call es service wih only range query params', async () => {
      // Given
      const params = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
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

  describe('getTotalByActionAndRange ', () => {
    it('call es service wih query', async () => {
      // Given
      const params = {
        action: 'initial',
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
      };
      const elasticResponse = {
        hits: {
          hits: [],
        },
        aggregations: {
          initial: {
            value: 42,
          },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsService.getTotalByActionAndRange(params);
      // Then
      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
      expect(search.mock.calls).toHaveLength(1);
    });
  });

  describe('getTotalForActionsAndFiAndRangeByWeek ', () => {
    it('call es service wih query', async () => {
      // Given
      const params = {
        fi: 'foo',
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
      };
      const elasticResponse = {
        hits: {
          total: 0,
          max_score: 0,
          hits: [],
        },
        aggregations: {
          week: {
            buckets: [
              {
                key: 1561939200000,
                doc_count: 16,
                action: {
                  doc_count_error_upper_bound: 0,
                  sum_other_doc_count: 0,
                  buckets: [
                    {
                      key: 'rnippcheck',
                      doc_count: 9,
                      count: {
                        value: 9,
                      },
                    },
                    {
                      key: 'initial',
                      doc_count: 2,
                      count: {
                        value: 2,
                      },
                    },
                    {
                      key: 'verification',
                      doc_count: 2,
                      count: {
                        value: 2,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsService.getTotalForActionsAndFiAndRangeByWeek(
        params,
      );
      // Then
      expect(search.mock.calls).toHaveLength(1);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].events).toHaveLength(3);
      expect(result[0].events[0].count).toBe(9);
    });
  });
});
