import { Test } from '@nestjs/testing';
import { StatsQueries } from './stats.queries';

describe('StatsQueries', () => {
  const START_DATE = new Date('2019-05-01');
  const STOP_DATE = new Date('2019-07-01');

  let statsQueries: StatsQueries;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [StatsQueries],
    }).compile();

    statsQueries = await module.get<StatsQueries>(StatsQueries);
  });

  describe('getEvents', () => {
    it('Should return a query', () => {
      // Given
      const params = {
        start: START_DATE,
        stop: STOP_DATE,
      };
      // When
      const result = statsQueries.getEvents(params);
      // Then
      expect(result).toBeDefined(), expect(result.index).toBe('stats');
      expect(result.body.query.bool.must[1].range.date.gte).toBe(
        START_DATE.getTime(),
      );
      expect(result.body.query.bool.must[1].range.date.lte).toBe(
        STOP_DATE.getTime(),
      );
    });
  });

  describe('getTotalByActionAndRange', () => {
    it('Should return a query', () => {
      // Given
      const params = {
        action: 'foo',
        start: START_DATE,
        stop: STOP_DATE,
      };
      // When
      const result = statsQueries.getTotalByActionAndRange(params);
      // Then
      expect(result).toBeDefined(), expect(result.index).toBe('stats');
      expect(result.body.query.bool.must[0].term).toEqual({ action: 'foo' });
      expect(result.body.query.bool.must[2].range.date.gte).toBe(
        START_DATE.getTime(),
      );
      expect(result.body.query.bool.must[2].range.date.gte).toBe(
        START_DATE.getTime(),
      );
      expect(result.body.query.bool.must[2].range.date.lte).toBe(
        STOP_DATE.getTime(),
      );
    });
  });

  describe('getTotalForActionsAndFiAndRangeByWeek', () => {
    it('Should return a query', () => {
      // Given
      const params = {
        fi: 'foo',
        start: START_DATE,
        stop: STOP_DATE,
      };
      // When
      const result = statsQueries.getTotalForActionsAndFiAndRangeByWeek(params);
      // Then
      expect(result).toBeDefined(), expect(result.index).toBe('stats');
      expect(result.body.query.bool.must[0].term).toEqual({ fi: 'foo' });
      expect(result.body.query.bool.must[2].range.date.gte).toBe(
        START_DATE.getTime(),
      );
      expect(result.body.query.bool.must[2].range.date.gte).toBe(
        START_DATE.getTime(),
      );
      expect(result.body.query.bool.must[2].range.date.lte).toBe(
        STOP_DATE.getTime(),
      );
    });
  });
});
