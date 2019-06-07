import Config from '../../../src/services/Config';

describe('config', () => {
  describe('getAPIRoot', () => {
    it('Should return a string', () => {
      // Given
      const input = { API_ROOT: 'foo' };
      const config = new Config(input);
      // When
      const result = config.getAPIRoot();
      // Then
      expect(result).toBe('foo');
    });
  });
  describe('getMailjet', () => {
    it('Should return an object', () => {
      // Given
      const input = { MAILJET_KEY: 'foo', MAILJET_SECRET: 'bar' };
      const config = new Config(input);
      // When
      const result = config.getMailjet();
      // Then
      expect(result).toEqual({ key: 'foo', secret: 'bar' });
    });
  });
});
