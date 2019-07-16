import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserCreation } from './value-object/user-creation';
import { UserRole } from './roles.enum';

describe('UserService', () => {
  let userService: UserService;
  const userRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([User])],
      providers: [UserService, Repository],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepository)
      .compile();

    userService = await module.get<UserService>(UserService);
    jest.resetAllMocks();
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
      await userService.findByUsername('jean_moust');

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: 'jean_moust',
      });
    });

    it('fails when the user is not found', async () => {
      userRepository.findOne.mockRejectedValue('User not found');

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
      );
      await userService.createUser(userCreation);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      const { passwordHash } = userRepository.save.mock.calls[0][0];
      expect(bcrypt.compare(userCreation.password, passwordHash)).toBeTruthy();
    });
  });
});
