import { AuthenticationService } from './authentication.service';
import { Test } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/roles.enum';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  const mockedUserService = {
    findByUsername: jest.fn(),
    compareHash: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: mockedUserService },
      ],
    }).compile();

    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    jest.resetAllMocks();
  });

  describe('validateUser', () => {
    let user;
    let username;
    let password;
    beforeEach(() => {
      user = {
        passwordHash: Symbol('password hash'),
        token: Symbol('2ddeb850-ee40-43ed-903e-44a5dad759d8'),
        roles: [],
      };
      username = Symbol('username');
      password = Symbol('password');
      jest
        .spyOn(mockedUserService, 'findByUsername')
        .mockImplementation(candidate => {
          if (candidate === username) {
            return Promise.resolve(user);
          }
          return Promise.reject('User not found');
        });
      jest
        .spyOn(mockedUserService, 'compareHash')
        .mockReturnValue(Promise.resolve(true));
    });

    describe('login', () => {
      it('calls the UserService findByUsername', async () => {
        await authenticationService.validateCredentials(username, password);
        expect(mockedUserService.findByUsername).toHaveBeenCalledTimes(1);
        expect(mockedUserService.findByUsername).toHaveBeenCalledWith(username);
      });

      it('fails to validate the credentials if no user is found', async () => {
        return expect(
          authenticationService.validateCredentials('jeanmoust', password),
        ).rejects.toBeDefined();
      });

      it('calls the UserService compareHash', async () => {
        await authenticationService.validateCredentials(username, password);
        expect(mockedUserService.compareHash).toHaveBeenCalledTimes(1);
        expect(mockedUserService.compareHash).toHaveBeenCalledWith(
          password,
          user.passwordHash,
        );
      });

      it('returns an error if the credentials are invalid', async () => {
        jest
          .spyOn(mockedUserService, 'compareHash')
          .mockReturnValue(Promise.resolve(false));
        return expect(
          authenticationService.validateCredentials(username, password),
        ).resolves.toBe(null);
      });

      it('returns the user if the credentials are valid', async () => {
        const actualUser = await authenticationService.validateCredentials(
          username,
          password,
        );
        expect(actualUser).toBe(user);
      });
    });

    describe('first-login', () => {
      beforeEach(() => {
        // setup
        user.roles = [UserRole.NEWUSER];
      });

      it('returns the user if the activation token and the credentials are valid', async () => {
        // action
        const actualUser = await authenticationService.validateCredentials(
          username,
          password,
          user.token,
        );

        // assert
        expect(actualUser).toBe(user);
      });

      it('returns "null" if the activation token is valid', async () => {
        // action
        const actualUser = await authenticationService.validateCredentials(
          username,
          password,
          'Not the token',
        );

        // assert
        expect(actualUser).toBeNull();
      });

      it('returns "null" if the activation token is valid but the credentials are invalid', async () => {
        // setup
        jest
          .spyOn(mockedUserService, 'compareHash')
          .mockReturnValue(Promise.resolve(false));

        // action
        const actualUser = await authenticationService.validateCredentials(
          username,
          'nop',
          user.token,
        );

        // assert
        expect(actualUser).toBeNull();
      });
    });
  });
});
