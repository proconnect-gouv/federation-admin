import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteInfo } from '@nestjs/common/interfaces';
import { CsurfMiddleware } from '@nest-middlewares/csurf';
import { ConsoleModule } from 'nestjs-console';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { AppContextMiddleware } from '@fc/shared/app-context/middleware/app-context.middleware';
import { AccountModule } from '@fc/shared/account/account.module';
import { AccountController } from '@fc/shared/account/account.controller';
import { AuthenticationModule } from '@fc/shared/authentication/authentication.module';
import { AuthenticationController } from '@fc/shared/authentication/authentication.controller';
import { AuthenticatedMiddleware } from '@fc/shared/authentication/middleware/authenticated.middleware';
import { TotpMiddleware } from '@fc/shared/authentication/middleware/totp.middleware';
import { CliModule } from '@fc/shared/cli/cli.module';
import { LoggerModule } from '@fc/shared/logger/logger.module';
import { StatsModule } from './stats/stats.module';
import { LocalsInterceptor } from './meta/locals.interceptor';
import * as otplib from 'otplib';

const otplibProvider = {
  provide: 'otplib',
  useValue: otplib,
};

@Module({
  imports: [
    AuthenticationModule,
    AccountModule,
    ConsoleModule,
    CliModule,
    LoggerModule,
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
    StatsModule,
  ],
  providers: [LocalsInterceptor, otplibProvider],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      .apply(AppContextMiddleware, AuthenticatedMiddleware, CsurfMiddleware)
      .forRoutes(AppController, AccountController);

    consumer.apply(CsurfMiddleware).forRoutes(AuthenticationController);

    consumer
      .apply(AppContextMiddleware, TotpMiddleware)
      .forRoutes({ path: '/account/enrollment', method: RequestMethod.PATCH });

    const totpAccount = [
      {
        path: '/account/create',
        method: RequestMethod.POST,
      },
      {
        path: '/account/:key',
        method: RequestMethod.DELETE,
      },
      {
        path: '/account/update-account/:username',
        method: RequestMethod.PATCH,
      },
    ];

    const totpRoutes: RouteInfo[] = [...totpAccount];

    consumer.apply(TotpMiddleware).forRoutes(...totpRoutes);
  }
}
