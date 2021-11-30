import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { MetricDto } from '../dto/metric.dto';
import { StatsApiService } from '../service/stats-api.service';
import { StatsApiQueriesService } from './stats-api-queries.service';

describe('StatsApiService', () => {
  let service: StatsApiService;

  const search = jest.fn();

  const elasticsearchService = {
    getClient: () => ({ search }),
  };

  const statsApiQueriesService = {
    getLastIdentitiesCount: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchService,
        StatsApiService,
        StatsApiQueriesService,
      ],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchService)
      .overrideProvider(StatsApiQueriesService)
      .useValue(statsApiQueriesService)
      .compile();
    service = module.get<StatsApiService>(StatsApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserCount', () => {
    const data = {
      hits: {
        hits: [
          {
            _source: {
              key: 'identity',
              value: 31586148,
              date: '2021-11-23T00:00:00.000Z',
              range: 'day',
            },
          },
        ],
      },
    };

    const query = {
      index: 'metrics',
      size: 1,
      from: 0,
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  key: 'identity',
                },
              },
              {
                match: {
                  range: 'day',
                },
              },
            ],
          },
        },
      },
    };

    it('should be defined', () => {
      expect(service.getUserCount).toBeDefined();
    });

    it('should call StatsApiQueriesService:getLastIdentitiesCount function', async () => {
      // Given
      statsApiQueriesService.getLastIdentitiesCount.mockResolvedValueOnce(
        query,
      );

      await elasticsearchService.getClient().search.mockResolvedValueOnce(data);
      const spy = jest.spyOn(statsApiQueriesService, 'getLastIdentitiesCount');
      // When
      await service.getUserCount();
      // Then
      expect(spy).toHaveBeenCalled();
    });

    it('should call this.elasticsearchService:getClient:search function', async () => {
      // Given
      const spy = jest.spyOn(elasticsearchService.getClient(), 'search');

      statsApiQueriesService.getLastIdentitiesCount.mockResolvedValueOnce(
        query,
      );

      await elasticsearchService.getClient().search.mockResolvedValueOnce(data);

      // When
      await service.getUserCount();
      // Then
      expect(spy).toHaveBeenCalled();
    });

    it('should return the data', async () => {
      // Given
      statsApiQueriesService.getLastIdentitiesCount.mockResolvedValueOnce(
        query,
      );

      await elasticsearchService.getClient().search.mockResolvedValueOnce(data);

      // When
      const result = await service.getUserCount();
      // Then
      expect(result instanceof MetricDto).toBe(true);
      expect(result.key).toStrictEqual('identity');
      expect(result.value).toStrictEqual(31586148);
      expect(result.date).toStrictEqual('2021-11-23T00:00:00.000Z');
      expect(result.range).toStrictEqual('day');
    });
  });
});
