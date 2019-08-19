import { BadRequestException } from '@nestjs/common';
import { throwError } from 'rxjs';
import { FormErrorsInterceptor } from './form-errors.interceptor';

describe('FormErrorsInterceptor', () => {
  const template = 'yolo/croute';
  const renderResult = jest.fn();
  const dto = jest.fn();

  const request = {
    body: dto,
    csrfToken: jest.fn(),
    totp: 'valid',
  };
  const response = {
    status: jest.fn(),
    render: jest.fn(),
  };

  const executionContext = {
    switchToHttp: jest.fn(),
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

  beforeEach(() => {
    jest.resetAllMocks();

    request.csrfToken.mockReturnValue('ThIs_Is_A_cSrF_tOkEn');

    response.status.mockReturnValue(this);
    response.render.mockReturnValue(renderResult);

    executionContext.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
      getResponse: jest.fn().mockReturnValue(response),
    });

    request.totp = 'valid';
  });

  it("should render the specified template with errors sent by Nest's built-in ValidationPipe", done => {
    delete request.totp;

    // action
    formErrorsInterceptor
      .intercept(executionContext, callHandler)
      .subscribe(result => {
        // expect
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

  it('should render the template rendered when totp is valid', done => {
    // action
    formErrorsInterceptor
      .intercept(executionContext, callHandler)
      .subscribe(result => {
        // expect
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

  it('should render the template rendered when totp is invalid', () => {
    // setup
    request.totp = 'invalid';

    // action
    formErrorsInterceptor.intercept(executionContext, callHandler);
    expect(response.render).toHaveBeenCalledTimes(1);
    expect(response.render).toHaveBeenCalledWith(template, {
      errors: {
        _totp: ["Le TOTP saisi n'est pas valide"],
      },
      values: dto,
      csrfToken: 'ThIs_Is_A_cSrF_tOkEn',
    });
  });
});
