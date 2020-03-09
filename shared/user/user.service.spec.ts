import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.sql.entity';
import { UserService } from './user.service';
import { UserRole } from './roles.enum';
import { IUserPasswordUpdateDTO } from './interface/user-password-update-dto.interface';
import { ICreateUserDTO } from './interface/create-user-dto.interface';
import { IsPasswordCompliant } from '../account/validator/is-compliant.validator';
import { ConfigService } from 'nestjs-config';
import { MailerService } from '../mailer/mailer.service';
import { MailerModule } from '../mailer/mailer.module';
import * as uuid from 'uuid';

const mockValidate = jest.fn();
IsPasswordCompliant.prototype.validate = mockValidate;

describe('UserService', () => {
  let userService: UserService;
  const userRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const generatePasswordMock = {
    generate: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const transporterMock = {
    send: jest.fn(),
  };

  const generatePasswordProvider = {
    provide: 'generatePassword',
    useValue: generatePasswordMock,
  };

  const user = {
    id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
    username: 'fred',
    roles: [
      'new_account',
      'inactive_admin',
      'inactive_operator',
      'inactive_security',
    ],
    passwordHash:
      // correspond à ce password : 'MyPass20!!'
      '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
  };

  const mockToken = '3a95ebfa-cd28-40f1-ab6e-5eb4cef352e3';
  const userTokenExpiresIn = 2880;
  beforeEach(async () => {
    configServiceMock.get.mockReturnValue({
      userTokenExpiresIn,
    });

    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([User]),
        MailerModule.forRoot({
          transport: 'log',
          emailOptions: {
            mailjetKey: 'someKey',
            mailjetSecret: 'someSecret',
            smtpSenderName: 'someName',
            smtpSenderEmail: 'someEmail',
          },
        }),
      ],
      providers: [
        UserService,
        generatePasswordProvider,
        Repository,
        ConfigService,
        MailerService,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepositoryMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(MailerService)
      .useValue(transporterMock)
      .compile();

    userService = await module.get<UserService>(UserService);

    jest.resetAllMocks();

    jest.spyOn(uuid, 'v4').mockReturnValueOnce(mockToken);
  });

  describe('callGeneratePassword', () => {
    it('should be called with the wright arguments', () => {
      // setup

      const args = {
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true,
      };

      // action
      userService.callGeneratePassword();
      // assertion
      expect(generatePasswordMock.generate).toHaveBeenCalledWith(args);
    });
  });

  describe('generateTmpPass', () => {
    it('should return a temporary password', () => {
      // Set up
      mockValidate.mockReturnValue(true);
      userService.callGeneratePassword = jest
        .fn()
        .mockReturnValue('GoodToGo10!!');

      // action
      const result = userService.generateTmpPass();

      // assertion
      expect(result).toEqual('GoodToGo10!!');
    });

    it('should return an error message', () => {
      // Set up
      mockValidate.mockReturnValue(false);
      userService.callGeneratePassword = jest
        .fn()
        .mockReturnValue('GoodToGo10!!');

      // action
      const result = userService.generateTmpPass();

      // assertion
      expect(result).toEqual(
        'The password could not be generated, please try again',
      );
    });
  });

  describe('enrollUser', () => {
    it('should call updatePassword', async () => {
      // setup
      const enrollmentPassword = {
        password: 'MyPass10!!',
        passwordConfirmation: 'MyPass10!!',
      };
      userService.updatePassword = jest.fn().mockReturnValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: [
          'new_account',
          'inactive_admin',
          'inactive_operator',
          'inactive_security',
        ],
      });
      const expectedRoles = ['admin', 'operator', 'security'];

      // action
      const result = await userService.enrollUser(user, enrollmentPassword);

      // assertion
      expect(userService.updatePassword).toHaveBeenCalledTimes(1);
      expect(userService.updatePassword).toHaveBeenCalledWith(
        user,
        enrollmentPassword.password,
        { roles: expectedRoles },
      );
      expect(result).toBeInstanceOf(Object);
    });

    it('should fall back in else statement', async () => {
      // setup
      const enrollmentPassword = {
        password: 'MyPass10!!',
        passwordConfirmation: 'MyPass10!!',
      };
      userService.updatePassword = jest.fn().mockRejectedValue('false');

      // action
      try {
        await userService.enrollUser(user, enrollmentPassword);
      } catch (err) {
        const message = err.message;

        // assertion
        expect(userService.updatePassword).toHaveBeenCalledTimes(1);
        expect(message).toBeTruthy();
      }
      expect.hasAssertions();
    });
  });

  describe('compareHash', () => {
    it('resolves true if the hashes match', async () => {
      const password = 'georgesmoustaki';
      const hash =
        '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e';

      return expect(userService.compareHash(password, hash)).resolves.toBe(
        true,
      );
    });

    it("resolves false if the hashes don't match", async () => {
      const password = 'georgesmoustaki';
      const hash = 'la barbe de sa femme';

      return expect(userService.compareHash(password, hash)).resolves.toBe(
        false,
      );
    });
  });

  describe('findByUsername', () => {
    it('calls the repository', async () => {
      userRepositoryMock.findOne.mockImplementation(() =>
        Promise.resolve({
          email: 'toto@toto.com',
          roles: ['admin'],
          passwordHash: 'MyPass',
          secret: 'MySecret',
        }),
      );
      const foundUser = await userService.findByUsername('jean_moust');

      expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        username: 'jean_moust',
      });
      expect(foundUser).toHaveProperty('email');
      expect(foundUser).toHaveProperty('roles');
      expect(foundUser).toHaveProperty('passwordHash');
      expect(foundUser).toHaveProperty('secret');
    });

    it('fails when the user is not found', async () => {
      userRepositoryMock.findOne.mockRejectedValue('User not found');

      return expect(
        userService.findByUsername('michael jackson'),
      ).rejects.toBeDefined();
    });
  });

  describe('createUser', () => {
    it('creates the user', async () => {
      const userMock: ICreateUserDTO = {
        username: 'jean_moust',
        email: 'jean@moust.lol',
        password: 'georgesmoustaki',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SECURITY],
        secret: '1234',
      };

      configServiceMock.get.mockReturnValueOnce({
        app_root: '/foo/bar',
        appName: 'Exploitation',
        smtpSenderName: 'someString',
        smtpSenderEmail: 'someString',
      });

      // Private method testing https://stackoverflow.com/a/35991491/1071169
      userService[
        // tslint:disable-next-line no-string-literal
        'setAuthenticationTokenExpirationDate'
      ] = jest.fn().mockReturnValue({
        tokenCreatedAt: '2020-03-03T16:36:56.135Z',
        tokenExpiresAt: '2020-03-05T16:36:56.135Z',
      });

      userService.sendNewAccountEmail = jest.fn().mockReturnValueOnce({});

      await userService.createUser(userMock);
      expect(userRepositoryMock.save).toHaveBeenCalledTimes(1);
      const { passwordHash } = userRepositoryMock.save.mock.calls[0][0];
      expect(bcrypt.compare(userMock.password, passwordHash)).toBeTruthy();
      expect(userRepositoryMock.save).toHaveBeenCalledWith({
        email: 'jean@moust.lol',
        passwordHash,
        roles: ['admin', 'operator', 'security'],
        secret: '1234',
        token: mockToken,
        tokenCreatedAt: '2020-03-03T16:36:56.135Z',
        tokenExpiresAt: '2020-03-05T16:36:56.135Z',
        username: 'jean_moust',
      });
    });

    it('does not create the user because of a database failure', async () => {
      const userMock: ICreateUserDTO = {
        username: 'jean_moust',
        email: 'jean@moust.lol',
        password: 'georgesmoustaki',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SECURITY],
        secret: '1234',
      };

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.resolve('toto'));
      userRepositoryMock.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('The user could not be saved'));

      configServiceMock.get.mockReturnValueOnce({
        app_root: '/foo/bar',
        appName: 'Exploitation',
        smtpSenderName: 'someString',
        smtpSenderEmail: 'someString',
      });

      userService.sendNewAccountEmail = jest.fn().mockReturnValueOnce({});
      try {
        await userService.createUser(userMock);
      } catch (err) {
        const { message } = err;
        expect(message).toEqual('The user could not be saved');
      }
      expect.hasAssertions();
    });

    it('does not create the user because of a bcrypt failure', async () => {
      const userMock: ICreateUserDTO = {
        username: 'jean_moust',
        email: 'jean@moust.lol',
        password: 'georgesmoustaki',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SECURITY],
        secret: '1234',
      };
      jest
        .spyOn(bcrypt, 'hash')
        .mockRejectedValueOnce(
          new Error('password hash could not be generated'),
        );
      configServiceMock.get.mockReturnValueOnce({
        app_root: '/foo/bar',
      });
      try {
        await userService.createUser(userMock);
      } catch (err) {
        const { message } = err;
        expect(message).toEqual('password hash could not be generated');
      }
      expect.hasAssertions();
    });
  });

  describe('setAuthenticationTokenExpirationDate', () => {
    it('should return an object with two objects of type date', () => {
      // action
      // tslint:disable-next-line no-string-literal
      const result = userService['setAuthenticationTokenExpirationDate']();
      // assert
      expect(result.tokenCreatedAt).toBeInstanceOf(Date);
      expect(result.tokenExpiresAt).toBeInstanceOf(Date);
    });

    it('should return an object with two objects of type date', () => {
      // action
      // tslint:disable-next-line no-string-literal
      const result = userService['setAuthenticationTokenExpirationDate']();
      // assert
      expect(Object.keys(result)).toMatchObject([
        'tokenCreatedAt',
        'tokenExpiresAt',
      ]);
    });

    it('should set "tokenExpiresAt" to "userTokenExpiresIn" minutes after "tokenCreatedAt"', () => {
      // action
      // tslint:disable-next-line no-string-literal
      const result = userService['setAuthenticationTokenExpirationDate']();
      // assert
      expect(
        result.tokenExpiresAt.getTime() - result.tokenCreatedAt.getTime(),
      ).toBe(userTokenExpiresIn * 60 * 1000);
    });
  });

  describe('deleteUserById', () => {
    it('calls the delete function of the userRepositoryMock', async () => {
      // set up
      const id = '123';
      const expectedRepositoryDeleteArguments = { id: '123' };
      // action
      await userService.deleteUserById(id);
      // assertion
      expect(userRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.delete).toHaveBeenCalledWith(
        expectedRepositoryDeleteArguments,
      );
    });
  });

  describe('updateUserAccount', () => {
    it('should call updatePassword', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      userService.updatePassword = jest.fn().mockResolvedValue(true);

      // action
      await userService.updateUserAccount(user, dataMock);

      // assert
      expect(userService.updatePassword).toHaveBeenCalledTimes(1);
      expect(userService.updatePassword).toHaveBeenCalledWith(
        user,
        dataMock.password,
        {},
      );
    });

    it('should fall back in else statement', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      userService.updatePassword = jest.fn().mockRejectedValue(false);

      // action
      try {
        await userService.updateUserAccount(user, dataMock);
      } catch (err) {
        const message = err.message;

        // assertion
        expect(userService.updatePassword).toHaveBeenCalledTimes(1);
        expect(message).toEqual('password could not be updated');
      }
      expect.hasAssertions();
    });

    it('should not call updatePassword', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      const userMock = {
        passwordHash: 'y/cvxrzo6dRMIMD4dgdOGci',
      };
      userService.updatePassword = jest.fn().mockResolvedValue(true);

      // action
      try {
        await userService.updateUserAccount(userMock, dataMock);
      } catch (err) {
        const message = err.message;

        // assert
        expect(userService.updatePassword).toHaveBeenCalledTimes(0);
        expect(message).toEqual(
          'password could not be updated because old password is invalid',
        );
      }
      expect.hasAssertions();
    });
  });

  describe('updatePassword', () => {
    it('should update a user password', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      userService.findByUsername = jest.fn().mockResolvedValue({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: ['admin'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });

      // action
      const result = await userService.updatePassword(
        user,
        dataMock.password,
        dataMock,
      );

      // assert
      expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Object);
    });

    it('should not update a user password', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      userService.findByUsername = jest.fn().mockResolvedValue({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: ['admin'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });
      userRepositoryMock.update = jest.fn().mockRejectedValueOnce(false);

      // action
      try {
        await userService.updatePassword(user, dataMock.password, dataMock);
      } catch (err) {
        const message = err.message;

        // assert
        expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
        expect(message).toEqual('password could not be updated');
      }
      expect.hasAssertions();
    });
  });

  describe('passwordDoesNotContainUsername', () => {
    it('should return false if username is contained in the password', () => {
      // given
      const password = 'fredHasANotSecuredPassword10!!';
      // when
      const result = userService.passwordDoesNotContainUsername(
        password,
        user.username,
      );
      // then
      expect(result).toEqual(false);
    });

    it('should return false if username is contained in the password, case insensitively', () => {
      // given
      const password = 'fReDHasANotSecuredPassword10!!';
      // when
      const result = userService.passwordDoesNotContainUsername(
        password,
        user.username,
      );
      // then
      expect(result).toEqual(false);
    });

    it('should return true if username is not contained in the password', () => {
      // given
      const password = 'thePasswordIsSecured10!!';
      // when
      const result = userService.passwordDoesNotContainUsername(
        password,
        user.username,
      );
      // then
      expect(result).toEqual(true);
    });
  });
});
