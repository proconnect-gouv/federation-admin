import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  const authenticationServiceMock = {
    validateCredentials: jest.fn(),
  };
  const localStrategy = new LocalStrategy(authenticationServiceMock);
  const req = {
    flash: jest.fn(),
    csrfToken: function csrfToken() {
      return 'mygreatcsrftoken';
    },
  };
  describe('validate', () => {
    it('should validate the user authentication', async () => {
      // setup
      authenticationServiceMock.validateCredentials.mockReturnValueOnce({
        username: 'toto',
      });
      // action
      const result = await localStrategy.validate(req, 'user', 'toto');
      // assertion
      expect(result).toEqual({ username: 'toto' });
      expect(req.flash).toHaveBeenCalledTimes(0);
    });
    it('flashes username or password is invalid', async () => {
      // setup
      authenticationServiceMock.validateCredentials.mockReturnValueOnce(
        undefined,
      );
      // action
      await localStrategy.validate(req, 'user', 'toto');
      // assertion
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'error',
        "Nom d'utilisateur ou mot de passe incorrect.",
      );
    });
    it('falls back in the catch statement because of a database error', async () => {
      // setup
      authenticationServiceMock.validateCredentials.mockRejectedValueOnce(
        new Error('The user could be found due to a database error'),
      );
      // action
      try {
        await localStrategy.validate(req, 'user', 'toto');
      } catch (err) {
        const { message } = err;
        expect(message).toEqual(
          'The user could be found due to a database error',
        );
      }
      expect.hasAssertions();
    });
  });
});
