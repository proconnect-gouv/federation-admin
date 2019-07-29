import { DummyApiGuard } from './dummy-api.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('DummyApiGuard', () => {
  const config = {
    key: 'foo',
  };

  const configService = {
    get: () => config,
  };

  const createContext = (headers): ExecutionContext => ({
    getHandler: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        headers,
      }),
    }),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
  });

  it('blocks the request if no key given', () => {
    // Given
    const headers = {};
    const context = createContext(headers);
    const dummyApiGuard = new DummyApiGuard(configService);
    // When
    const canActivate = dummyApiGuard.canActivate(context);
    // Then
    expect(canActivate).toBeFalsy();
  });

  it('blocks the request if invalid key given', () => {
    // Given
    const headers = { token: 'bar' };
    const context = createContext(headers);
    const dummyApiGuard = new DummyApiGuard(configService);
    // When
    const canActivate = dummyApiGuard.canActivate(context);
    // Then
    expect(canActivate).toBeFalsy();
  });

  it('lets the request if correct key given', () => {
    // Given
    const headers = { token: 'foo' };
    const context = createContext(headers);
    const dummyApiGuard = new DummyApiGuard(configService);
    // When
    const canActivate = dummyApiGuard.canActivate(context);
    // Then
    expect(canActivate).toBeTruthy();
  });
});
