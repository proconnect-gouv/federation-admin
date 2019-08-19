import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import * as generatePassword from 'generate-password';

const generatePasswordProvider = {
  provide: 'generatePassword',
  useValue: generatePassword,
};

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, generatePasswordProvider],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
