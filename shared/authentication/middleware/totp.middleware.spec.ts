import { TotpMiddleware } from './totp.middleware';

describe('TotpMiddleware', () => {
  const configServiceMock = {
    get: jest.fn(),
  };
  const optlibServiceMock = {
    authenticator: {
      options: {},
      check: jest.fn(),
    },
  };

  configServiceMock.get.mockImplementation(() => 'sha1');
  const totpMiddleware = new TotpMiddleware(
    configServiceMock,
    optlibServiceMock,
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets totp property of req to valid', () => {
    // setup

    const req = {
      user: {
        secret: 'shut',
      },
      body: {
        _totp: '123456',
      },
      totp: '',
    };
    const res = jest.fn();
    const next = jest.fn();

    optlibServiceMock.authenticator.check.mockReturnValueOnce(true);

    totpMiddleware.use(req, res, next);
    expect(next).toBeCalledTimes(1);
    expect(req.totp).toEqual('valid');
  });

  it('sets totp property of req to invalid', () => {
    // setup

    const req = {
      user: {
        secret: 'shut',
      },
      body: {
        _totp: '123456',
      },
      totp: '',
    };
    const res = jest.fn();
    const next = jest.fn();

    optlibServiceMock.authenticator.check.mockReturnValueOnce(false);

    totpMiddleware.use(req, res, next);
    expect(next).toBeCalledTimes(1);
    expect(req.totp).toEqual('invalid');
  });
});
