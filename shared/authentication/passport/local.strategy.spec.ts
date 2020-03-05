import { LocalStrategy } from './local.strategy';
import { LoggerService } from '@fc/shared/logger/logger.service';
import {
  AuthenticationActions,
  AuthenticationStates,
} from '../authentication-actions.enum';

describe('LocalStrategy', () => {
  const authenticationServiceMock = {
    validateCredentials: jest.fn(),
  };
  const businessEventMock = jest.fn();
  const loggerMock = ({
    businessEvent: businessEventMock,
  } as unknown) as LoggerService;
  const localStrategy = new LocalStrategy(
    authenticationServiceMock,
    loggerMock,
  );
  const req = {
    flash: jest.fn(),
    csrfToken: function csrfToken() {
      return 'mygreatcsrftoken';
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

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

    it('logs the username failing his authentication', async () => {
      // setup
      authenticationServiceMock.validateCredentials.mockReturnValueOnce(
        undefined,
      );
      // action
      await localStrategy.validate(req, 'user', 'toto');
      // assertion
      expect(loggerMock.businessEvent).toBeCalledTimes(1);
      expect(loggerMock.businessEvent).toBeCalledWith({
        action: AuthenticationActions.TOKEN_SIGNUP,
        state: AuthenticationStates.DENIED,
        user: 'user',
      });
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
          'The user could not be found due to a database error',
        );
      }
      expect.hasAssertions();
    });
  });
});
