import { Inject, Injectable } from '@nestjs/common';
import { IUserService } from '../user/user.service';

export interface IAuthenticationService {
  validateCredentials(username: string, password: string): Promise<any>;
}

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  constructor(
    @Inject('IUserService') private readonly userService: IUserService,
  ) {}

  async validateCredentials(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      return null;
    }
    const passwordMatches = await this.userService.compareHash(
      password,
      user.passwordHash,
    );
    if (passwordMatches) {
      return user;
    }
    return null;
  }
}
