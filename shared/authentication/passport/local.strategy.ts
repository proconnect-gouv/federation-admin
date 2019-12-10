import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { IAuthenticationService } from '../authentication.service';
import { User } from '../../user/user.sql.entity';

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

  async validate(req, username: string, password: string): Promise<User> {
    let user;
    try {
      user = await this.authenticationService.validateCredentials(
        username,
        password,
      );
    } catch (err) {
      throw new Error('The user could not be found due to a database error');
    }
    if (!user) {
      req.flash('error', "Nom d'utilisateur ou mot de passe incorrect.");
    }
    return user;
  }
}
