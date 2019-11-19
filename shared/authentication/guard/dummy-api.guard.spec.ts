import bcrypt from 'bcrypt';
import { DummyApiGuard } from './dummy-api.guard';
import { ExecutionContext } from '@nestjs/common';

describe('DummyApiGuard', () => {
  const config = {
    key: '$2b$10$2XP.WZzsHirpnj2K17V1cujFvOuWvR0.nck6FU7dWhm9nzofc2NRe',
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
    getType: jest.fn().mockReturnValue('http'),
  });

  it('blocks the request if no key given', async () => {
    // Given
    const headers = {};
    const context = createContext(headers);
    const dummyApiGuard = new DummyApiGuard(configService);
    // When
    const canActivate = await dummyApiGuard.canActivate(context);
    // Then
    expect(canActivate).toBeFalsy();
  });

  it('blocks the request if invalid key given', async () => {
    // Given
    const headers = { token: 'bar' };
    const context = createContext(headers);
    const dummyApiGuard = new DummyApiGuard(configService);
    // When
    const canActivate = await dummyApiGuard.canActivate(context);
    // Then
    expect(canActivate).toBeFalsy();
  });

  it('lets the request if correct key given', async () => {
    // Given
    const headers = { token: 'foo' };
    const context = createContext(headers);
    const dummyApiGuard = await new DummyApiGuard(configService);
    // When
    const canActivate = dummyApiGuard.canActivate(context);
    // Then
    expect(canActivate).toBeTruthy();
  });
});
