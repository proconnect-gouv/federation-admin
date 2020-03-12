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
      const input = {
        MAILJET_KEY: 'fake-mailjet-key',
        MAILJET_SECRET: 'fake-mailjet-secret',
        HTTPS_PROXY: 'fake-proxy-url',
      };
      const config = new Config(input);
      // When
      const result = config.getMailjet();
      // Then
      expect(result).toEqual({
        key: 'fake-mailjet-key',
        secret: 'fake-mailjet-secret',
        options: { proxyUrl: 'fake-proxy-url' },
      });
    });
  });
});
