import { LocalStrategy } from './local.strategy';
import { LoggerService } from '@fc/shared/logger/logger.service';
import {
  AuthenticationActions,
  AuthenticationStates,
} from '../authentication-actions.enum';
import { UserRole } from '../../user/roles.enum';

describe('LocalStrategy', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });
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
      const date = new Date('2030-01-01');
      authenticationServiceMock.validateCredentials.mockReturnValueOnce({
        username: 'toto',
        roles: ['new_account', 'inactive_operator'],
        tokenExpiresAt: date,
      });
      // action
      const result = await localStrategy.validate(req, 'user', 'toto');
      // assertion
      expect(result).toEqual({
        roles: ['new_account', 'inactive_operator'],
        tokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
        username: 'toto',
      });
      expect(req.flash).toHaveBeenCalledTimes(0);
    });

    it('flashes Informations de connexion erronées.', async () => {
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
        'Informations de connexion erronées.',
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

    it('sends "Informations de connexion erronées." if no user was found indatabase', async () => {
      // action
      await localStrategy.validate(req, 'user', 'toto');

      // assert
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'error',
        'Informations de connexion erronées.',
      );
    });

    it('sends "Informations de connexion erronées." if authentication token has expired', async () => {
      // setup
      const tokenExpiresAt = new Date('2020-01-04T14:36:50.644Z');
      authenticationServiceMock.validateCredentials.mockReturnValueOnce({
        roles: [UserRole.NEWUSER],
        tokenExpiresAt,
      });
      // action
      await localStrategy.validate(req, 'user', 'toto');

      // assert
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenLastCalledWith(
        'error',
        'Informations de connexion erronées.',
      );
      expect(loggerMock.businessEvent).toBeCalledTimes(1);
      expect(loggerMock.businessEvent).toBeCalledWith({
        action: AuthenticationActions.TOKEN_SIGNUP,
        state: AuthenticationStates.DENIED,
        user: 'user',
      });
    });

    it('sends back a user if token has not expired ', async () => {
      // setup
      const tokenExpiresAt = new Date('2030-01-04T14:36:50.644Z');
      authenticationServiceMock.validateCredentials.mockReturnValueOnce({
        roles: [UserRole.NEWUSER],
        tokenExpiresAt,
      });
      // action
      const result = await localStrategy.validate(req, 'user', 'toto');
      // assert
      expect(result).toEqual({
        roles: ['new_account'],
        tokenExpiresAt,
      });
    });
  });
});
