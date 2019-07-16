import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class FormErrorsInterceptor implements NestInterceptor {
  constructor(private readonly template: string) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const dto = context.switchToHttp().getRequest().body;
    return next.handle().pipe(
      catchError(error => {
        // In case of validation error, we render the template with the errors and the DTO
        return of(error.message).pipe(
          map(({ message }) => message),
          map(validationErrors => {
            return validationErrors.reduce(
              (validationErrorsObject, validationError) => ({
                ...validationErrorsObject,
                [validationError.property]: Object.values(
                  validationError.constraints,
                ),
              }),
              {},
            );
          }),
          map(errors => {
            return context
              .switchToHttp()
              .getResponse()
              .render(this.template, { errors, values: dto });
          }),
        );
      }),
    );
  }
}
