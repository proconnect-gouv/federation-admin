import { Test, TestingModule } from '@nestjs/testing';
import { StatsChartsController } from './stats-charts.controller';
import { StatsService } from '../../service/stats.service';
import { StatsQueries } from '../../stats.queries';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ChartsService } from '../../service/charts/charts.service';

describe('StatsCharts Controller', () => {
  let controller: StatsChartsController;
  const search = jest.fn();
  const elasticsearchService = {
    getClient: () => ({ search }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsChartsController],
      providers: [
        StatsService,
        StatsQueries,
        ElasticsearchService,
        ChartsService,
      ],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchService)
      .compile();

    controller = module.get<StatsChartsController>(StatsChartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chart choice', () => {
    it('should have a GET choice path', () => {
      expect(controller.choice).toBeDefined();
    });
  });
});
