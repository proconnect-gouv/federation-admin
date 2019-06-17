import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { IUserService, UserService } from './user.service';

const userServiceProvider = {
  provide: 'IUserService',
  useClass: UserService,
};

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [userServiceProvider],
  exports: [userServiceProvider],
})
export class UserModule {}
