import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { IAuthenticationService } from '../authentication.service';
import { User } from '../../user/user.sql.entity';
import { IAuthenticationTrack } from '../authentication-track.interface';
import {
  AuthenticationActions,
  AuthenticationStates,
} from '../authentication-actions.enum';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { UserRole } from '../../user/roles.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('IAuthenticationService')
    private readonly authenticationService: IAuthenticationService,
    private readonly logger: LoggerService,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  private track(log: IAuthenticationTrack) {
    this.logger.businessEvent(log);
  }

  async validate(req, username: string, password: string): Promise<User> {
    let user;
    const { params = {} } = req;
    const { token } = params;

    try {
      user = await this.authenticationService.validateCredentials(
        username,
        password,
        token,
      );
    } catch (err) {
      throw new Error('The user could not be found due to a database error');
    }
    if (!user) {
      this.track({
        action: AuthenticationActions.TOKEN_SIGNUP,
        state: AuthenticationStates.DENIED,
        user: username,
      });
      req.flash('error', 'Informations de connexion erronées.');
      return null;
    }

    const date = new Date();
    if (
      user.roles.includes(UserRole.NEWUSER) &&
      user.tokenExpiresAt.getTime() - date.getTime() < 0
    ) {
      this.track({
        action: AuthenticationActions.TOKEN_SIGNUP,
        state: AuthenticationStates.DENIED,
        user: username,
      });
      req.flash('error', 'Informations de connexion erronées.');
      return null;
    }

    return user;
  }
}
