import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { UserModule } from '@fc/shared/user/user.module';
import { UserService } from '@fc/shared/user/user.service';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';
import { CliService } from './cli.service';

@Module({
  imports: [ConsoleModule, UserModule],
  providers: [CliService, UserService, TotpService],
  exports: [CliService],
})
export class CliModule {}
