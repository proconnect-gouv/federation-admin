import { AuthenticationController } from './authentication.controller';

describe('AuthenticationController', () => {
  const authenticationController = new AuthenticationController();
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
    const res = {
      redirect: jest.fn(),
      locals: {
        APP_ROOT: '/foo/bar',
      },
    };
    // action
    authenticationController.login(res);
    // assertion
    expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
  });
  describe('logout method', () => {
    it('logs out the user and redirects to the homepage', () => {
      // setup
      const req = {
        logout: jest.fn(),
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
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
    });
  });
});
