import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './passport/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalSerializer } from './passport/local.serializer';
import { LocalAuthGuard } from './guard/local.guard';
import * as passport from 'passport';
import { RolesGuard } from 'shared/authentication/guard/roles.guard';

const authenticationServiceProvider = {
  provide: 'IAuthenticationService',
  useClass: AuthenticationService,
};

export const PASSPORT = 'Passport';

const passportProvider = {
  provide: PASSPORT,
  useValue: passport,
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'local', session: true }),
    UserModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    authenticationServiceProvider,
    LocalStrategy,
    LocalSerializer,
    LocalAuthGuard,
    RolesGuard,
    passportProvider,
  ],
  exports: [LocalSerializer, passportProvider],
})
export class AuthenticationModule {}
