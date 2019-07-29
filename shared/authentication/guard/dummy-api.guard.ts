import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectConfig } from 'nestjs-config';
import { Observable } from 'rxjs';

@Injectable()
export class DummyApiGuard implements CanActivate {
  constructor(@InjectConfig() private readonly config) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers || !request.headers.token) {
      return false;
    }

    if (request.headers.token !== this.config.get('dummy-api-guard').key) {
      return false;
    }

    return true;
  }
}
