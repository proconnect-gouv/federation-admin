import { LoggerService } from '@fc/shared/logger/logger.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'nestjs-config';
import { StatsApiService } from './service/stats-api.service';
import { StatsApiController } from './stats-api.controller';

describe('StatsApiController', () => {
  let controller: StatsApiController;

  const search = jest.fn();
  const elasticsearchServiceMock = {
    getClient: () => ({ search }),
  };
  const statsApiServiceMock = {
    getUserCount: jest.fn(),
  };
  const configServiceMock = {
    get: jest.fn(),
  };
  const LoggerServiceMock = {
    error: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsApiController],
      providers: [ConfigService, LoggerService, StatsApiService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(LoggerServiceMock)
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchServiceMock)
      .overrideProvider(StatsApiService)
      .useValue(statsApiServiceMock)
      .compile();
    controller = module.get<StatsApiController>(StatsApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTotalUsers', () => {
    it('should be defined', () => {
      expect(controller.getTotalUsers).toBeDefined();
    });

    it('should call statsApiService.getUserCount() function', async () => {
      // Given
      const spy = jest
        .spyOn(statsApiServiceMock, 'getUserCount')
        .mockResolvedValueOnce([]);
      // When
      await controller.getTotalUsers();
      // Then
      expect(spy).toHaveBeenCalled();
    });

    it('should return the users total', async () => {
      // Given
      statsApiServiceMock.getUserCount.mockResolvedValueOnce({
        key: 'identity',
        value: 31586148,
        date: '2021-11-23T00:00:00.000Z',
        range: 'day',
      });

      const expected = {
        key: 'identity',
        value: 31586148,
        date: '2021-11-23T00:00:00.000Z',
        range: 'day',
      };
      // When
      const result = await controller.getTotalUsers();

      // Then
      expect(result).toStrictEqual(expected);
    });
  });
});
