import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserCreation } from './value-object/user-creation';
import { UserPasswordUpdate } from './value-object/user-password-update';
import { UserRole } from './roles.enum';
import * as generatePassword from 'generate-password';

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

  const generatePasswordProvider = {
    provide: 'generatePassword',
    useValue: generatePasswordMock,
  };

  const user = {
    id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
    roles: ['new_account', 'inactive_admin', 'inactive_operator'],
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([User])],
      providers: [UserService, generatePasswordProvider, Repository],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepositoryMock)
      .compile();

    userService = await module.get<UserService>(UserService);
    jest.resetAllMocks();
  });

  describe('generateTmpPass', () => {
    it('should be called with the wright arguments', () => {
      // setup
      const args = {
        length: 10,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true,
      };
      // action
      userService.generateTmpPass();
      // assertion
      expect(generatePasswordMock.generate).toHaveBeenCalledWith(args);
    });
  });
  describe('enrollUser', () => {
    it('should update the user', async () => {
      // setup
      const userPasswordUpdate = new UserPasswordUpdate(
        'MyPasswordIsValid10!!',
      );
      const userEntityMock = new User();
      userEntityMock.passwordHash =
        '$2b$10$Dvb6R/8l5ntSJPxowMmEA.sJbZwTmPu1z0tHj5e6glb0s8Magc4we';
      userEntityMock.roles = ['admin', 'operator'] as UserRole[];
      userRepositoryMock.update.mockImplementation(() => Promise.resolve(true));
      const result = await userService.enrollUser(user, userPasswordUpdate);
      // assertion
      expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(User);
    });
    it('should not update the user', async () => {
      // setup
      const userPasswordUpdate = new UserPasswordUpdate('MyPasswordIsNotValid');
      const userEntityMock = new User();
      userEntityMock.passwordHash = '$2b$10$Dvb6R/8l5ntSJ';
      userEntityMock.roles = ['admin', 'operator'] as UserRole[];
      userRepositoryMock.update.mockImplementation(() =>
        Promise.reject(new Error('wrong budy')),
      );
      const result = await userService.enrollUser(user, userPasswordUpdate);
      // assertion
      expect(result).toBeInstanceOf(Error);
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
      const userCreation = new UserCreation(
        'jean_moust',
        'jean@moust.lol',
        'georgesmoustaki',
        [UserRole.ADMIN, UserRole.OPERATOR],
        '1234',
      );
      await userService.createUser(userCreation);
      expect(userRepositoryMock.save).toHaveBeenCalledTimes(1);
      const { passwordHash } = userRepositoryMock.save.mock.calls[0][0];
      expect(bcrypt.compare(userCreation.password, passwordHash)).toBeTruthy();
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
});
