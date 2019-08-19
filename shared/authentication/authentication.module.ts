import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './passport/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalSerializer } from './passport/local.serializer';
import { LocalAuthGuard } from './guard/local.guard';
import * as passport from 'passport';
import { RolesGuard } from './guard/roles.guard';
import { TotpService } from './totp/totp.service';

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
    TotpService,
  ],
  exports: [LocalSerializer, passportProvider, TotpService],
})
export class AuthenticationModule {}
