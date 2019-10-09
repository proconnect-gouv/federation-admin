import { IUserPasswordUpdateDTO } from './user-password-update-dto.interface';
import { DeleteResult, UpdateResult } from 'typeorm';
import { IEnrollUserDto } from './enroll-user-dto.interface';
import { User } from '../user.entity';
import { UserCreation } from '../value-object/user-creation';

export interface IUserService {
  updateUserAccount(user, data: IUserPasswordUpdateDTO): Promise<UpdateResult>;
  enrollUser(user, enrollmentPassword: IEnrollUserDto): Promise<UpdateResult>;
  findByUsername(username: string): Promise<User>;
  compareHash(password: string, hash: string): Promise<boolean>;
  createUser(userCreation: UserCreation);
  deleteUserById(id: string): Promise<DeleteResult>;
  updatePassword({ username, id }, password, userData): Promise<UpdateResult>;
}
