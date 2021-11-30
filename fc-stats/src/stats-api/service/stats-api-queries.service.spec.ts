import { Test, TestingModule } from '@nestjs/testing';
import { StatsApiQueriesService } from './stats-api-queries.service';

describe('StatsApiQueriesService', () => {
  let service: StatsApiQueriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsApiQueriesService],
    }).compile();

    service = module.get<StatsApiQueriesService>(StatsApiQueriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLastIdentitiesCount', () => {
    it('should call generateSort', () => {
      // Given
      jest
        .spyOn(StatsApiQueriesService.prototype as any, 'generateSort')
        .mockReturnValue({
          date: {
            order: 'desc',
          },
        });

      // When
      service.getLastIdentitiesCount();

      // Then
      /* tslint:disable:no-string-literal */
      expect(service['generateSort']).toBeDefined();
      expect(service['generateSort']).toHaveBeenCalled();
      expect(service['generateSort']).toHaveBeenCalledWith('date', 'desc');
    });

    it('should return a query', () => {
      // When
      const result = service.getLastIdentitiesCount();
      const queryMust = result.body.query.bool.must;
      // Then
      expect(result).toBeDefined();
      expect(result.index).toBe('metrics');
      expect(queryMust[0].match.key).toBe('identity');
      expect(queryMust[1].match.range).toBe('day');
    });
  });
});
