import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserCreation } from './value-object/user-creation';
import { UserPasswordUpdate } from './value-object/user-password-update';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @Inject('generatePassword') private readonly generatePassword,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  generateTmpPass() {
    return this.generatePassword.generate({
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
  }

  async enrollUser(user, userPasswordUpdate: UserPasswordUpdate) {
    const passwordHash = await bcrypt.hash(
      userPasswordUpdate.password,
      this.SALT_ROUNDS,
    );

    user.roles = user.roles
      .filter(role => role !== 'new_account')
      .map(role => role.replace('inactive_', ''));

    const userRepository = this.userRepository;
    const userEntity = new User();
    userEntity.passwordHash = passwordHash;
    userEntity.roles = user.roles;
    try {
      await userRepository.update(user.id, userEntity);
    } catch (err) {
      return err;
    }
    return userEntity;
  }

  async findByUsername(username: string): Promise<any> {
    return this.userRepository.findOne({ username });
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createUser(userCreation: UserCreation) {
    const passwordHash = await bcrypt.hash(
      userCreation.password,
      this.SALT_ROUNDS,
    );
    return this.userRepository.save({
      username: userCreation.username,
      email: userCreation.email,
      roles: userCreation.roles,
      passwordHash,
      secret: userCreation.secret,
    });
  }

  async deleteUserById(id: string): Promise<any> {
    return this.userRepository.delete({ id });
  }
}
