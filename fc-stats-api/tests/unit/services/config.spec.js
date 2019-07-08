import Config from '../../../src/services/Config';

describe('config', () => {
  describe('getElastic', () => {
    it('Should return an object with expected keys', () => {
      // Given
      const input = { ES_HOST: 'foo', ES_PORT: 42 };
      const config = new Config(input);
      // When
      const result = config.getElastic();
      // Then
      expect(typeof result).toBe('object');
      expect(result).toEqual({
        host: 'foo:42',
      });
    });
  });
});
