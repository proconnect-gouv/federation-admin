import { Test } from '@nestjs/testing';
import {
  AuthenticationService,
  IAuthenticationService,
} from '@fc/shared/authentication/authentication.service';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { TotpMiddleware } from './totp.middleware';

describe('TotpMiddleware', () => {
  let totpMiddleware: TotpMiddleware;
  let service: IAuthenticationService;
  let logger: LoggerService;

  const optlibServiceMock = {
    authenticator: {
      options: {},
      check: jest.fn(),
    },
  };

  const AuthenticationServiceMock: IAuthenticationService = {
    validateCredentials: jest.fn(),
    getAuthenticationAttemptCount: jest.fn(),
    getAuthenticationFailureReason: jest.fn(),
    saveUserAuthenticationFailure: jest.fn(),
    getUserSecret: jest.fn(),
  };

  const loggerMock = {
    businessEvent: jest.fn(),
  };

  const res = {
    redirect: jest.fn(),
  };
  const next = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TotpMiddleware,
        { provide: 'otplib', useValue: optlibServiceMock },
        AuthenticationService,
        LoggerService,
      ],
    })
      .overrideProvider(AuthenticationService)
      .useValue(AuthenticationServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    totpMiddleware = module.get<TotpMiddleware>(TotpMiddleware);
    service = await module.get<AuthenticationService>(AuthenticationService);
    logger = await module.get<LoggerService>(LoggerService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets totp property of req to valid', () => {
    const req = {
      userSecret: null,
      user: 'shut',
      body: {
        _totp: '123456',
      },
      totp: '',
      flash: jest.fn(),
      headers: {
        referer: 'https//:toto.com',
      },
    };
    optlibServiceMock.authenticator.check.mockReturnValueOnce(true);

    totpMiddleware.use(req, res, next);
    expect(next).toBeCalledTimes(1);
    expect(req.totp).toEqual('valid');
  });

  it('sets totp property of req to invalid', () => {
    const req = {
      userSecret: null,
      user: 'shut',
      body: {
        _totp: '123456',
      },
      totp: '',
      flash: jest.fn(),
    };
    optlibServiceMock.authenticator.check.mockReturnValueOnce(false);

    totpMiddleware.use(req, res, next);
    expect(next).toBeCalledTimes(1);
    expect(req.totp).toEqual('invalid');
  });

  it('should log user after checking valid TOTP', async () => {
    const req = {
      userSecret: null,
      user: null,
      body: {
        _totp: '123456',
      },
      totp: '',
      flash: jest.fn(),
      headers: {
        referer: 'https//:toto.com',
      },
    };
    // Action
    optlibServiceMock.authenticator.check.mockReturnValueOnce(true);
    await totpMiddleware.use(req, res, next);

    // Expected
    expect(service.getUserSecret).toBeCalledTimes(1);
    expect(next).toBeCalledTimes(1);
  });

  it('should redirect user on logging user after checking invalid TOTP', async () => {
    const req = {
      userSecret: null,
      user: null,
      body: {
        _totp: '123456',
      },
      totp: '',
      flash: jest.fn(),
    };
    // Action
    optlibServiceMock.authenticator.check.mockReturnValueOnce(false);
    await totpMiddleware.use(req, res, next);

    // Expected
    expect(service.getUserSecret).toBeCalledTimes(1);
    expect(service.saveUserAuthenticationFailure).toBeCalledTimes(1);
    expect(logger.businessEvent).toBeCalledTimes(1);
    expect(req.flash).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledTimes(1);
  });
});
