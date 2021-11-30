import { LoggerService } from '@fc/shared/logger/logger.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'nestjs-config';
import { StatsApiGuard } from './stats-api.guard';

describe('StatsApiGuard', () => {
  let guard: StatsApiGuard;

  const configServiceMock = {
    get: jest.fn(),
  };
  const loggerServiceMock = {
    error: jest.fn(),
  };

  const argumentsHostMock = {
    getNext: jest.fn(),
    getRequest: jest.fn(),
    getResponse: jest.fn(),
  };

  const contextMock = {
    getHandler: jest.fn(),
    switchToHttp: jest.fn().mockResolvedValueOnce(argumentsHostMock),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getType: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, LoggerService, StatsApiGuard],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    guard = module.get<StatsApiGuard>(StatsApiGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getToken', () => {
    it('should be defined', () => {
      /* tslint:disable:no-string-literal */

      expect(guard['getToken']).toBeDefined();
    });

    it('should get the token from the request', () => {
      // Given
      const requestMock = {
        headers: {
          authorization: 'Bearer 1234567890',
        },
      };
      const expected = '1234567890';

      // When
      const result = guard['getToken'](requestMock);

      // Then
      expect(result).toStrictEqual(expected);
    });

    it('should log an error if the token is not send with the request', () => {
      // Given
      const requestMock = {
        headers: {},
      };
      const spy = jest.spyOn(loggerServiceMock, 'error');
      const expected = null;

      // When
      const result = guard['getToken'](requestMock);

      // Then
      expect(result).toStrictEqual(expected);
      expect(spy).toHaveBeenCalled();
    });

    it('should log an error if the token does not have the required format', () => {
      // Given
      const requestMock = {
        headers: {
          authorization: '1234567890',
        },
      };
      const expected = null;
      const spy = jest.spyOn(loggerServiceMock, 'error');

      // When
      const result = guard['getToken'](requestMock);

      // Then
      expect(result).toStrictEqual(expected);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkTokenValidity', () => {
    it('should be defined', () => {
      expect(guard['checkTokenValidity']).toBeDefined();
    });

    it('should return true if the request token is valid', () => {
      // Given
      const requestToken = '12345567';
      const configToken = '12345567';

      // When
      const result = guard['checkTokenValidity'](requestToken, configToken);

      // Then
      expect(result).toBeTruthy();
    });

    it('should return false if the request token is invalid', () => {
      // Given
      const requestToken = '12345567';
      const configToken = '7654"21';

      // When
      const result = guard['checkTokenValidity'](requestToken, configToken);

      // Then
      expect(result).toBeFalsy();
    });

    it('should return false if the request token is not send', () => {
      // Given
      const requestToken = undefined;
      const configToken = '7654"21';

      // When
      const result = guard['checkTokenValidity'](requestToken, configToken);

      // Then
      expect(result).toBeFalsy();
    });
  });

  describe('canActivate', () => {
    it('should be defined', () => {
      expect(guard.canActivate).toBeDefined();
    });

    it('should return true', () => {
      // Given
      const requestMock = {
        headers: {
          Authorization: `Bearer 1234567890`,
        },
      };

      contextMock.switchToHttp.mockReturnValue({
        getRequest: jest.fn().mockReturnValue(requestMock),
      });

      jest
        .spyOn(StatsApiGuard.prototype as any, 'getToken')
        .mockReturnValue('1234567890');

      configServiceMock.get.mockReturnValue({
        usersWebsiteToken: '1234567890',
      });

      // When
      const result = guard.canActivate(contextMock);

      // Then
      expect(result).toBeTruthy();
    });

    it('should return false', () => {
      // Given
      const requestMock = {
        headers: {
          Authorization: `Bearer 0987654321`,
        },
      };
      contextMock.switchToHttp.mockReturnValue({
        getRequest: jest.fn().mockReturnValue(requestMock),
      });

      jest
        .spyOn(StatsApiGuard.prototype as any, 'getToken')
        .mockReturnValue('0987654321');

      configServiceMock.get.mockReturnValue({
        usersWebsiteToken: '1234567890',
      });

      // When
      const result = guard.canActivate(contextMock);

      // Then
      expect(result).toBeFalsy();
    });
  });
});
