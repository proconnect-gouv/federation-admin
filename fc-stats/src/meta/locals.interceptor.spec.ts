import { Test } from '@nestjs/testing';
import { LocalsInterceptor } from './locals.interceptor';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { ConfigService } from 'nestjs-config';

describe('LocalsInterceptor', () => {
  let localsInterceptor;
  const configService = {
    get: jest.fn(),
  };
  const loggerService = {
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LocalsInterceptor, ConfigService, LoggerService],
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .overrideProvider(LoggerService)
      .useValue(loggerService)
      .compile();
    localsInterceptor = await module.get<LocalsInterceptor>(LocalsInterceptor);
  });

  it('should add the meta information to all responses', async () => {
    const req = {
      user: 'jean_moust',
    };
    const res: any = {
      locals: {},
    };
    const currentBranch = 'testing';
    const shortHash = '3f17f344';
    const longHash = '3f17f344448066d75f9eb33ade5fdcd799d89352';
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res),
      })),
    };
    const next = {
      handle: jest.fn(),
    };
    configService.get.mockReturnValueOnce({
      environment: 'testing',
      commitUrlPrefix:
        'https://gitlab.com/france-connect/FranceConnect/commit/',
      currentBranch,
      latestCommitShortHash: shortHash,
      latestCommitLongHash: longHash,
      app_root: '/foo/bar',
    });

    await localsInterceptor.intercept(context, next);

    expect(configService.get).toBeCalledWith('app');
    expect(res.locals.APP_ENVIRONMENT).toBe('testing');
    expect(res.locals.APP_ROOT).toBe('/foo/bar');
    expect(res.locals.COMMIT_URL_PREFIX).toBe(
      'https://gitlab.com/france-connect/FranceConnect/commit/',
    );
    expect(res.locals.GIT_CURRENT_BRANCH).toBe(currentBranch);
    expect(res.locals.GIT_LATEST_COMMIT_SHORT_HASH).toBe(shortHash);
    expect(res.locals.GIT_LATEST_COMMIT_LONG_HASH).toBe(longHash);
    expect(res.locals.CURRENT_USER).toBe(req.user);
    expect(next.handle).toBeCalledTimes(1);
  });

  describe('getMapped', () => {
    it('Should return mapped value if mapped', () => {
      // Given
      const mapping = { foo: 'fooValue' };
      // When
      const result = localsInterceptor.getMapped(mapping, 'foo');
      // Then
      expect(result).toBe('fooValue');
    });
    it('Should return given key if not mapped', () => {
      // Given
      const mapping = { foo: 'fooValue' };
      // When
      const result = localsInterceptor.getMapped(mapping, 'bar');
      // Then
      expect(result).toBe('bar');
      expect(loggerService.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatDate', () => {
    it('Should format day', () => {
      // Given
      const date = '2019-10-08T12:34:56.000Z';
      const granularity = 'day';
      // When
      const result = LocalsInterceptor.formatDate(date, granularity);
      // then
      expect(result).toBe('08/10/2019');
    });
    it('Should format week', () => {
      // Given
      const date = '2019-10-08T12:34:56.000Z';
      const granularity = 'week';
      // When
      const result = LocalsInterceptor.formatDate(date, granularity);
      // then
      expect(result).toBe('du 08/10 au 15/10/2019');
    });
    it('Should format month', () => {
      // Given
      const date = '2019-10-08T12:34:56.000Z';
      const granularity = 'month';
      // When
      const result = LocalsInterceptor.formatDate(date, granularity);
      // then
      expect(result).toBe('Oct 2019');
    });
    it('Should format year', () => {
      // Given
      const date = '2019-10-08T12:34:56.000Z';
      const granularity = 'year';
      // When
      const result = LocalsInterceptor.formatDate(date, granularity);
      // then
      expect(result).toBe('2019');
    });
    it('Should return a specific "all period" string', () => {
      // Given
      const date = '2019-10-08T12:34:56.000Z';
      const granularity = 'all';
      // When
      const result = LocalsInterceptor.formatDate(date, granularity);
      // then
      expect(result).toBe('Toute la période');
    });
    it('Should throw if not a valid granularity', () => {
      // Given
      const date = '2019-10-08T12:34:56.000Z';
      const granularity = 'foo';
      // then
      expect(() => LocalsInterceptor.formatDate(date, granularity)).toThrow(
        'granularity should be one of day|week|month|year|all',
      );
    });
    it('Should throw if not a valid date', () => {
      // Given
      const date = 'yolo';
      const granularity = 'day';
      // then
      expect(() => LocalsInterceptor.formatDate(date, granularity)).toThrow(
        'Invalid date: <yolo>',
      );
    });
  });
});
