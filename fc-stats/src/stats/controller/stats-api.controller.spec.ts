import { Test } from '@nestjs/testing';
import { StatsAPIController } from './stats-api.controller';
import { StatsService } from '../service/stats.service';
import { StatsQueries } from '../stats.queries';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';

describe('StatsAPIController', () => {
  let statsController;
  const search = jest.fn();
  const elasticsearchService = {
    getClient: () => ({ search }),
  };
  const config = {
    key: 'foo',
  };

  const configService = {
    get: () => config,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ElasticsearchModule.register({
          host: 'localhost:9200',
          log: 'trace',
        }),
      ],
      providers: [
        StatsService,
        StatsQueries,
        {
          provide: 'ConfigService',
          useValue: configService,
        },
      ],
      controllers: [StatsAPIController],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchService)
      .compile();

    statsController = module.get<StatsAPIController>(StatsAPIController);
    jest.resetAllMocks();
  });

  describe('totalForAction', () => {
    it('Should return ', async () => {
      // Given
      const query = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
        action: 'foo',
      };
      const elasticResponse = {
        hits: {
          hits: [],
        },
        aggregations: {
          foo: {
            value: 42,
          },
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsController.getTotalByActionAndRange(query);
      // Then
      expect(result).toBeDefined();
      expect(result).toEqual({
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
        action: 'foo',
        count: 42,
      });
    });
  });

  describe('totalByFi', () => {
    it('Should return ', async () => {
      // Given
      const query = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
        fi: 'foo',
      };
      const elasticResponse = {
        hits: {
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
      const result = await statsController.getTotalByFi(query);
      // Then
      expect(result).toBeDefined();
      expect(result).toEqual({
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
        fi: 'foo',
        weeks: [
          {
            startDate: 1561939200000,
            events: [
              { label: 'rnippcheck', count: 9 },
              {
                label: 'initial',
                count: 2,
              },
              {
                label: 'verification',
                count: 2,
              },
            ],
          },
        ],
      });
    });
  });
});
