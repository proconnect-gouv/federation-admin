import Config from '../../../src/services/Config';

describe('Config', () => {
  describe('getAPIRoot()', () => {
    it('Should return a string', () => {
      // Given
      const input = { API_ROOT: 'foo' };
      const config = new Config(input);
      // When
      const result = config.getAPIRoot();
      // Then
      expect(result).toBe('foo');
    });
    it('Should return a empty string if API_ROOT is void', () => {
      // Given
      const input = {};
      const config = new Config(input);
      // When
      const result = config.getAPIRoot();
      // Then
      expect(result).toBe('http://localhost:3000/api/v1');
    });
  });

  describe('getMail()', () => {
    it('Should return an object', () => {
      // Given
      const input = {
        HTTPS_PROXY: 'fake-proxy-url',
        MAILER_HOST: 'fake-proxy-host',
        MAILER_PORT: '465',
        MAILER_SECURE: 'false',
        MAILER_IGNORE_TLS: 'true',
      };
      const config = new Config(input);
      // When
      const result = config.getMail();
      // Then
      expect(result).toEqual({
        proxyUrl: 'fake-proxy-url',
        host: 'fake-proxy-host',
        port: parseInt('465', 10),
        secure: false,
        ignoreTLS: true,
      });
    });
  });

  describe('getAPIKey()', () => {
    it('Should return a string', () => {
      // Given
      const input = { API_KEY: 'foo' };
      const config = new Config(input);
      // When
      const result = config.getAPIKey();
      // Then
      expect(result).toBe('foo');
    });

    it('Should return a empty string if API_KEY is void', () => {
      // Given
      const input = {};
      const config = new Config(input);
      // When
      const result = config.getAPIKey();
      // Then
      expect(result).toBe('');
    });
  });

  describe('getMailerType()', () => {
    it('Should return a string', () => {
      // Given
      const input = { MAILER: 'foo' };
      const config = new Config(input);
      // When
      const result = config.getMailerType();
      // Then
      expect(result).toBe('foo');
    });

    it('Should return undefined if no mailer', () => {
      // Given
      const input = {};
      const config = new Config(input);
      // When
      const result = config.getMailerType();
      // Then
      expect(result).toBe(undefined);
    });
  });

  describe('getElasticOptions()', () => {
    it('Should return a Elastic configuration', () => {
      // Given
      const input = {
        ES_STATS_HOSTS: 'https://localhost:9300,https://localhost:9400',
        REQUEST_TIMEOUT: 42,
      };

      const resultMock = {
        node: ['https://localhost:9300', 'https://localhost:9400'],
        requestTimeout: 42,
      };
      const config = new Config(input);
      // When
      const result = config.getElasticOptions();
      // Then
      expect(result).toStrictEqual(resultMock);
    });
  });

  describe('getLogElastic()', () => {
    it('Should return a Elastic configuration', () => {
      // Given
      const input = {
        ES_LOGS_HOSTS: 'https://localhost:9300,https://localhost:9400',
        REQUEST_TIMEOUT: 42,
      };

      const resultMock = {
        node: ['https://localhost:9300', 'https://localhost:9400'],
        requestTimeout: 42,
      };
      const config = new Config(input);
      // When
      const result = config.getLogElastic();
      // Then
      expect(result).toStrictEqual(resultMock);
    });
  });

  describe('getElasticMainIndex()', () => {
    it('Should return a string', () => {
      // Given
      const input = { ES_MAIN_INDEX: 'foo' };
      const config = new Config(input);
      // When
      const result = config.getElasticMainIndex();
      // Then
      expect(result).toBe('foo');
    });

    it('Should return a string even if env is void', () => {
      // Given
      const input = {};
      const config = new Config(input);
      // When
      const result = config.getElasticMainIndex();
      // Then
      expect(result).toBe('franceconnect');
    });
  });

  describe('getElasticMetricsIndex()', () => {
    it('Should return a string', () => {
      // Given
      const input = { ES_METRICS_INDEX: 'foo' };
      const config = new Config(input);
      // When
      const result = config.getElasticMetricsIndex();
      // Then
      expect(result).toBe('foo');
    });
    it('Should return a string even if env is void', () => {
      // Given
      const input = {};
      const config = new Config(input);
      // When
      const result = config.getElasticMetricsIndex();
      // Then
      expect(result).toBe('metrics');
    });
  });

  describe('getElasticEventsIndex()', () => {
    it('Should return a string', () => {
      // Given
      const input = { ES_EVENTS_INDEX: 'foo' };
      const config = new Config(input);
      // When
      const result = config.getElasticEventsIndex();
      // Then
      expect(result).toBe('foo');
    });
    it('Should return a string even if env is void', () => {
      // Given
      const input = {};
      const config = new Config(input);
      // When
      const result = config.getElasticEventsIndex();
      // Then
      expect(result).toBe('events');
    });
  });

  describe('getMongo()', () => {
    it('Should return a mongo connection URL', () => {
      // Given
      const input = {
        FC_DB_HOSTS: 'je',
        FC_DB_USER: 'suis',
        FC_DB_PASSWORD: 'un',
        FC_DB_DATABASE: 'gentil',
        FC_DB_CONNECT_OPTIONS: 'developpeur',
        FC_DB_PASS: undefined,
        FC_DB_TLS_CA_FILE: 'fc/db/tls/ca/file',
        FC_DB_TLS: 'true',
        FC_DB_TLS_INSECURE: 'false',
        FC_DB_TLS_ALLOW_INVALID_HOST_NAME: 'false',
      };
      const resultMock = {
        uri: 'mongodb://suis:un@je/gentildeveloppeur',
        authSource: 'gentil',
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsCAFile: 'fc/db/tls/ca/file',
        tlsInsecure: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      const config = new Config(input);
      // When
      const result = config.getMongo();
      // Then
      expect(result).toEqual(resultMock);
    });
  });
});
