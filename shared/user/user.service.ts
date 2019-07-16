import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserCreation } from './value-object/user-creation';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(@InjectRepository(User) private readonly userRepository) {}

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
    });
  }
}
