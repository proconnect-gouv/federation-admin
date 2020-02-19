import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/roles.enum';

// the "token" parameter is used for the first connection
export interface IAuthenticationService {
  validateCredentials(
    username: string,
    password: string,
    token?: string,
  ): Promise<any>;
}

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  constructor(private readonly userService: UserService) {}

  async validateCredentials(
    username: string,
    password: string,
    token?: string,
  ): Promise<any> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      return null;
    }

    const passwordMatches = await this.userService.compareHash(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return null;
    }

    // FCP-657 -> user.roles.includes(UserRole.NEWUSER) + edit tests
    if (token && token !== user.token) {
      return null;
    }

    return user;
  }
}
