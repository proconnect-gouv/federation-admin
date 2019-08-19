import { UserRole } from '../roles.enum';

export class UserCreation {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly roles: UserRole[],
    public readonly secret: string,
  ) {}
}
