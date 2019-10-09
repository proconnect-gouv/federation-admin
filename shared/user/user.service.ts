import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserCreation } from './value-object/user-creation';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { IUserPasswordUpdateDTO } from './interface/user-password-update-dto.interface';
import { IEnrollUserDto } from './interface/enroll-user-dto.interface';
import { IUserService } from './interface/user-service.interface';

@Injectable()
export class UserService implements IUserService {
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

  async enrollUser(
    user,
    enrollmentPassword: IEnrollUserDto,
  ): Promise<UpdateResult> {
    const roles = user.roles
      .filter(role => role !== 'new_account')
      .map(role => role.replace('inactive_', ''));
    try {
      return await this.updatePassword(user, enrollmentPassword.password, {
        roles,
      });
    } catch (err) {
      throw new Error('password could not be updated');
    }
  }

  async updateUserAccount(
    user,
    data: IUserPasswordUpdateDTO,
  ): Promise<UpdateResult> {
    const isValidPassword = await this.compareHash(
      data.currentPassword,
      user.passwordHash,
    );
    if (isValidPassword) {
      try {
        return await this.updatePassword(user, data.password, {});
      } catch (err) {
        throw new Error('password could not be updated');
      }
    } else {
      throw new Error(
        'password could not be updated because old password is invalid',
      );
    }
  }

  async findByUsername(username: string): Promise<User> {
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

  async deleteUserById(id: string): Promise<DeleteResult> {
    return this.userRepository.delete({ id });
  }

  async updatePassword(
    { username, id },
    password,
    userData,
  ): Promise<UpdateResult> {
    const newPasswordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    let userEntity;
    try {
      userEntity = await this.findByUsername(username);
      userEntity.passwordHash = newPasswordHash;
      Object.assign(userEntity, userData);
      await this.userRepository.update(id, userEntity);
    } catch (err) {
      throw new Error('password could not be updated');
    }
    return userEntity;
  }
}
