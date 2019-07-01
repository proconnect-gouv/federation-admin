import { Test } from '@nestjs/testing';
import { LocalsInterceptor } from './locals.interceptor';
import { ConfigService } from 'nestjs-config';

describe('LocalsInterceptor', () => {
  let localsInterceptor;
  const configService = {
    get: jest.fn()
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LocalsInterceptor, ConfigService]
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();
    localsInterceptor = await module.get<LocalsInterceptor>(LocalsInterceptor);
  });

  it('should add the meta information to all responses', async () => {
    const req = {
      user: 'jean_moust'
    };
    const res: any = {
      locals: {}
    };
    const currentBranch = 'testing';
    const shortHash = '3f17f344';
    const longHash = '3f17f344448066d75f9eb33ade5fdcd799d89352';
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res)
      }))
    };
    const next = {
      handle: jest.fn()
    };
    configService.get.mockReturnValueOnce({
      environment: 'testing',
      commitUrlPrefix:
        'https://gitlab.com/france-connect/FranceConnect/commit/',
      currentBranch,
      latestCommitShortHash: shortHash,
      latestCommitLongHash: longHash
    });

    await localsInterceptor.intercept(context, next);

    expect(configService.get).toBeCalledWith('app');
    expect(res.locals.APP_ENVIRONMENT).toBe('testing');
    expect(res.locals.COMMIT_URL_PREFIX).toBe(
      'https://gitlab.com/france-connect/FranceConnect/commit/'
    );
    expect(res.locals.GIT_CURRENT_BRANCH).toBe(currentBranch);
    expect(res.locals.GIT_LATEST_COMMIT_SHORT_HASH).toBe(shortHash);
    expect(res.locals.GIT_LATEST_COMMIT_LONG_HASH).toBe(longHash);
    expect(res.locals.CURRENT_USER).toBe(req.user);
    expect(next.handle).toBeCalledTimes(1);
  });
});
