import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

export interface IUserService {
  findByUsername(username: string): Promise<any>;

  compareHash(password: string, hash: string): Promise<boolean>;
}

@Injectable()
export class UserService implements IUserService {
  constructor(@InjectRepository(User) private readonly userRepository) {}

  async findByUsername(username: string): Promise<any> {
    return this.userRepository.findOne({ username });
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
