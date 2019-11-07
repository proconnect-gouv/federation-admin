import IndexMongoStats from '../../../src/jobs/IndexMongoStats';

describe('IndexMongoStats', () => {
  describe('getMetricId', () => {
    it('Should return same output with same input', () => {
      // Given
      const inputA = { key: 'foo', date: 'bar' };
      const inputB = { key: 'foo', date: 'bar' };
      // When
      const hashA = IndexMongoStats.getMetricId(inputA);
      const hashB = IndexMongoStats.getMetricId(inputB);
      // Then
      expect(hashA).toEqual(hashB);
    });
    it('Should return different output with different input', () => {
      // Given
      const inputA = { key: 'foo', date: 'bar' };
      const inputB = { key: 'foo', date: 'baz' };
      // When
      const hashA = IndexMongoStats.getMetricId(inputA);
      const hashB = IndexMongoStats.getMetricId(inputB);
      // Then
      expect(hashA).not.toEqual(hashB);
    });
  });

  describe('getStopDateForRange', () => {
    it('Sould return date + 1 day', () => {
      // Given
      const start = '2019-10-25';
      const range = 'day';
      // When
      const stop = IndexMongoStats.getStopDateForRange(start, range);
      // Then
      expect(stop).toBe('2019-10-26');
    });
    it('Sould return date + 1 week', () => {
      // Given
      const start = '2019-10-25';
      const range = 'week';
      // When
      const stop = IndexMongoStats.getStopDateForRange(start, range);
      // Then
      expect(stop).toBe('2019-11-01');
    });
    it('Sould return date + 1 month', () => {
      // Given
      const start = '2019-10-01';
      const range = 'month';
      // When
      const stop = IndexMongoStats.getStopDateForRange(start, range);
      // Then
      expect(stop).toBe('2019-11-01');
    });
    it('Sould return date + 1 year', () => {
      // Given
      const start = '2019-10-25';
      const range = 'year';
      // When
      const stop = IndexMongoStats.getStopDateForRange(start, range);
      // Then
      expect(stop).toBe('2020-10-25');
    });
  });
});
