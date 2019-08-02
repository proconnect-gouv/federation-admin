import { throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { FormErrorsInterceptor } from './form-errors.interceptor';

describe('FormErrorsInterceptor', () => {
  it("should render the specified template with errors sent by Nest's built-in ValidationPipe", done => {
    const template = 'yolo/croute';
    const renderResult = jest.fn();
    const dto = jest.fn();
    const response = {
      status: jest.fn().mockReturnValue(this),
      render: jest.fn().mockReturnValue(renderResult),
    };
    const executionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          body: dto,
          csrfToken: jest.fn().mockReturnValue('ThIs_Is_A_cSrF_tOkEn'),
        }),
        getResponse: jest.fn().mockReturnValue(response),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getHandler: jest.fn(),
    };
    const callHandler = {
      handle: () =>
        throwError(
          new BadRequestException([
            {
              property: 'password',
              constraints: {
                length: 'Length',
                strength: 'Strength',
              },
            },
            {
              property: 'age',
              constraints: {
                minimum: 'Minimum',
              },
            },
          ]),
        ),
    };
    const formErrorsInterceptor = new FormErrorsInterceptor(template);

    formErrorsInterceptor
      .intercept(executionContext, callHandler)
      .subscribe(result => {
        expect(result).toEqual(renderResult);
        expect(response.render).toHaveBeenCalledTimes(1);
        expect(response.render).toHaveBeenCalledWith(template, {
          errors: {
            password: ['Length', 'Strength'],
            age: ['Minimum'],
          },
          values: dto,
          csrfToken: 'ThIs_Is_A_cSrF_tOkEn',
        });
        done();
      });
  });
});
