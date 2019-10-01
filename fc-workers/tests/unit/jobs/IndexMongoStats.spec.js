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
});
