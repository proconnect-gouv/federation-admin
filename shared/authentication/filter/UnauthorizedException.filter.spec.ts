import { UnauthorizedExceptionFilter } from './UnauthorizedException.filter';
import { ArgumentsHost } from '@nestjs/common';

describe('UnauthorizedExceptionFilter', () => {
  it('redirects to the login page', () => {
    const redirect = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          redirect,
        }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    };
    const appRoot = '/foo/bar';
    const exceptionFilter = new UnauthorizedExceptionFilter(appRoot);

    exceptionFilter.catch(null, host as ArgumentsHost);

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/foo/bar/login');
  });
});
