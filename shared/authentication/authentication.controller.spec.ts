import { AuthenticationController } from './authentication.controller';
import { LoggerService } from '@fc/shared/logger/logger.service';

describe('AuthenticationController', () => {
  const loggerMock = ({
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const authenticationController = new AuthenticationController(loggerMock);
  describe('get login', () => {
    it('should return the login page with a csrf token', () => {
      // setup
      const req = {
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };
      // action
      const result = authenticationController.loginView(req);
      // assertion
      expect(result.csrfToken).toEqual('mygreatcsrftoken');
    });
  });
  describe('post login', () => {
    // setup
    const req = {
      user: {
        username: 'foo',
      },
    };

    const res = {
      redirect: jest.fn(),
      locals: {
        APP_ROOT: '/foo/bar',
      },
    };
    // action
    authenticationController.login(req, res);
    // assertion
    expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
  });
  describe('logout method', () => {
    it('logs out the user and redirects to the homepage', () => {
      // setup
      const req = {
        logout: jest.fn(),
        user: {
          username: 'foo',
        },
      };
      const res = {
        redirect: jest.fn(),
        locals: {
          APP_ROOT: '/foo/bar',
        },
      };
      authenticationController.logout(req, res);

      expect(req.logout).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/login');
    });
  });
});
