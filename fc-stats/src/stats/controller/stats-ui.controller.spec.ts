import { Test } from '@nestjs/testing';
import { StatsUIController } from './stats-ui.controller';
import { StatsService } from '../stats.service';
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

    it('Return empty object if no parameters are provided', async () => {
      // Given
      const query = {};
      // When
      const result = await statsController.list(query);
      // Then
      expect(result).toEqual({});
    });

    it('returns all the identity providers', async () => {
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
