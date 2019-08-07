import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Injectable()
@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  constructor(private readonly appRoot: string) {}

  catch(exception: UnauthorizedException, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    res.redirect(`${this.appRoot}/login`);
  }
}
