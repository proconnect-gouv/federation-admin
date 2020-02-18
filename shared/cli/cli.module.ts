import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { UserModule } from '@fc/shared/user/user.module';
import { UserService } from '@fc/shared/user/user.service';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';
import { CliService } from './cli.service';
import { MailerService } from '../mailer/mailer.service';
import { MailerModule } from '../mailer/mailer.module';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { EjsAdapter } from '../mailer/ejs.adapter';

@Module({
  imports: [
    ConsoleModule,
    UserModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: config.get('transporter.transport'),
        emailOptions: config.get('transporter'),
        template: {
          dir: `${__dirname}/emails`,
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CliService, UserService, TotpService, MailerService],
  exports: [CliService],
})
export class CliModule {}
