import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

export interface IAuthenticationService {
  validateCredentials(username: string, password: string): Promise<any>;
}

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  constructor(private readonly userService: UserService) {}

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
