import { DeleteResult, UpdateResult } from 'typeorm';
import { User } from '../user.entity';
import { ICreateUserDTO } from './create-user-dto.interface';
import { IEnrollUserDto } from './enroll-user-dto.interface';
import { IUserPasswordUpdateDTO } from './user-password-update-dto.interface';

export interface IUserService {
  generateTmpPass();
  updateUserAccount(user, data: IUserPasswordUpdateDTO): Promise<UpdateResult>;
  enrollUser(user, enrollmentPassword: IEnrollUserDto): Promise<UpdateResult>;
  findByUsername(username: string): Promise<User>;
  compareHash(password: string, hash: string): Promise<boolean>;
  createUser(user: ICreateUserDTO): Promise<User>;
  deleteUserById(id: string): Promise<DeleteResult>;
}
