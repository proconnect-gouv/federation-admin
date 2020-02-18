import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from 'nestjs-config';
import { MailerService } from '../mailer/mailer.service';
import { MailerModule } from '../mailer/mailer.module';
import { EjsAdapter } from '../mailer/ejs.adapter';
import { User } from './user.sql.entity';
import { UserService } from './user.service';
import * as generatePassword from 'generate-password';

const generatePasswordProvider = {
  provide: 'generatePassword',
  useValue: generatePassword,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
  providers: [UserService, generatePasswordProvider, MailerService],
  exports: [
    UserService,
    TypeOrmModule.forFeature([User]),
    generatePasswordProvider,
  ],
})
export class UserModule {}
