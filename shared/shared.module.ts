import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { CitizenModule } from './citizen/citizen.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [UserModule, AuthenticationModule, CitizenModule, LoggerModule],
  exports: [UserModule, AuthenticationModule, CitizenModule, LoggerModule],
})
export class SharedModule {}
