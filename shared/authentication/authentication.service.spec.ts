import { AuthenticationService } from './authentication.service';
import { Test } from '@nestjs/testing';

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
        { provide: 'IUserService', useValue: mockedUserService },
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
});
