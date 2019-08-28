import { Test } from '@nestjs/testing';
import { StatsUIController } from './stats-ui.controller';
import { StatsService } from '../service/stats.service';
import { StatsQueries } from '../stats.queries';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';

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
      providers: [StatsService, StatsQueries],
      controllers: [StatsUIController],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchService)
      .compile();

    statsController = module.get<StatsUIController>(StatsUIController);
    jest.resetAllMocks();
  });

  describe('list', () => {
    it('Return empty object if empty parameters are provided', async () => {
      // Given
      const query = {
        start: '',
        stop: '',
      };
      // When
      const result = await statsController.list(query);
      // Then
      expect(result).toEqual({});
    });

    it('Return empty object if empty parameters and empty filter are provided', async () => {
      // Given
      const query = {
        start: '',
        stop: '',
        filters: [{}],
      };
      // When
      const result = await statsController.list(query);
      // Then
      expect(result).toEqual({});
    });

    it('Should return stats and meta data', async () => {
      // Given
      const query = {
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
      const result = await statsController.list(query);
      // Then
      expect(result.stats).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it('Should return a filtered query', async () => {
      // Given
      const query = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
        filters: [{ key: 'fi', value: 'dgfip' }],
      };
      const elasticResponse = {
        hits: {
          hits: [
            {
              _index: 'stats',
              _type: 'entry',
              _id: 'foo',
              _score: null,
              _source: {
                fi: 'dgfip',
                count: 1,
                typeAction: 'initial',
                action: 'authentication',
                date: 1536278400000,
                fs: 'Retraites et solidarité',
              },
              sort: [
                1536278400000,
                'dgfip',
                'Retraites et solidarité',
                'initial',
                'authentication',
              ],
            },
            {
              _index: 'stats',
              _type: 'entry',
              _id: 'foo',
              _score: null,
              _source: {
                fi: 'dgfip',
                count: 1,
                typeAction: 'rnippcheck',
                action: 'rnippcheck',
                date: 1536278400000,
                fs: 'Recette NED Portail Grand Public',
              },
              sort: [
                1536278400000,
                'dgfip',
                'Recette NED Portail Grand Public',
                'rnippcheck',
                'rnippcheck',
              ],
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
      const result = await statsController.list(query);
      // Then
      expect(result.stats.length).toEqual(2);
      expect(result.stats[0].fi).toBe('dgfip');
      expect(result.stats[1].fi).toBe('dgfip');
    });

    it('Return empty object if no parameters are provided', async () => {
      // Given
      const query = {};
      // When
      const result = await statsController.list(query);
      // Then
      expect(result).toEqual({});
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
      const query = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
      };
      // When
      const { stats } = await statsController.list(query);
      // Then
      expect(stats).toEqual([
        {
          id: 'foo',
          fs: 'foo',
          fi: 'bar',
          count: 2,
          typeAction: 'fizz',
          action: 'buzz',
          date: new Date('2019-03-01'),
        },
      ]);
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
      const query = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
      };
      // When
      const { stats } = await statsController.list(query);
      // Then
      expect(stats).toEqual([
        {
          id: 'foo',
          fs: 'foo',
          fi: 'bar',
          count: 2,
          typeAction: 'fizz',
          action: 'buzz',
          date: new Date('2019-03-01'),
        },
      ]);
    });
  });
});
