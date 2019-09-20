import { Test } from '@nestjs/testing';
import { AccountModule } from './account.module';
import { AccountController } from './account.controller';
import { User } from '@fc/shared/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';
import { AccountService } from './account.service';
import { UserService } from '@fc/shared/user/user.service';
import * as generatePassword from 'generate-password';

describe('AccountModule', () => {
  it('compiles', async () => {
    // setup
    const generatePasswordProvider = {
      provide: 'generatePassword',
      useValue: generatePassword,
    };
    // action
    const module = await Test.createTestingModule({
      imports: [AccountModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(jest.fn())
      .overrideProvider(TotpService)
      .useValue(jest.fn())
      .overrideProvider(AccountService)
      .useValue(jest.fn())
      .overrideProvider(UserService)
      .useValue(jest.fn())
      .overrideProvider(generatePasswordProvider)
      .useValue(jest.fn())
      .compile();

    expect(module).toBeDefined();
    expect(module.get(AccountController)).toBeDefined();
  });
});
