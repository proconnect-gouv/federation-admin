import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { IAuthenticationService } from '../authentication.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('IAuthenticationService')
    private readonly authenticationService: IAuthenticationService,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(req, username: string, password: string, done) {
    const user = await this.authenticationService.validateCredentials(
      username,
      password,
    );
    if (!user) {
      req.flash('error', 'Invalid username or password.');
    }
    done(null, user);
  }
}
