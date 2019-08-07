import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectConfig } from 'nestjs-config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DummyApiGuard implements CanActivate {
  constructor(@InjectConfig() private readonly config) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers || !request.headers.token) {
      return false;
    }

    return bcrypt.compare(
      request.headers.token,
      this.config.get('dummy-api-guard').key,
    );
  }
}
