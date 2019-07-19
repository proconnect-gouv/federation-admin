import { Test } from '@nestjs/testing';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { StatsService } from './stats.service';
import { StatsQueries } from './stats.queries';
import { StatsDTO } from './dto/stats.dto';

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

  describe('getEvents', () => {
    it('call es service wih query', async () => {
      // Given
      const params = {
        action: 'initial',
        start: new Date('2019-01-01'),
        stop: new Date('2019-06-01'),
      };
      const elasticResponse = {
        hits: {
          hits: [
            {
              _index: "stats",
              _type: "entry",
              _id: "foo",
              _score: 1.42,
              _source: {
                fs: 'foo',
                fi: 'bar',
                count: 2,
                typeAction: 'fizz',
                action: 'buzz',
                date: new Date('2019-03-01'),
              }
            }
          ],
        },
      };
      search.mockResolvedValueOnce(elasticResponse);
      // When
      const result = await statsService.getEvents(params);
      // Then
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0] instanceof StatsDTO).toBe(true);
      expect(search.mock.calls).toHaveLength(1);
    });
  });
});
