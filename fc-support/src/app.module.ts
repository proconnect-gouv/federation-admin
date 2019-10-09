import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { AppContextMiddleware } from '@fc/shared/app-context/middleware/app-context.middleware';
import { AccountModule } from '@fc/shared/account/account.module';
import { AccountController } from '@fc/shared/account/account.controller';
import { AuthenticationModule } from '@fc/shared/authentication/authentication.module';
import { AuthenticationController } from '@fc/shared/authentication/authentication.controller';
import { AuthenticatedMiddleware } from '@fc/shared/authentication/middleware/authenticated.middleware';
import { TotpMiddleware } from '@fc/shared/authentication/middleware/totp.middleware';
import { RnippModule } from '@fc/shared/rnipp/rnipp.module';
import { RnippController } from '@fc/shared/rnipp/rnipp.controller';
import { LocalsInterceptor } from './meta/locals.interceptor';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { CsurfMiddleware } from '@nest-middlewares/csurf';
import { LoggerModule } from '@fc/shared/logger/logger.module';
import * as otplib from 'otplib';

const otplibProvider = {
  provide: 'otplib',
  useValue: otplib,
};

@Module({
  imports: [
    AuthenticationModule,
    AccountModule,
    RnippModule,
    LoggerModule,
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
  ],
  providers: [LocalsInterceptor, otplibProvider],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    CsurfMiddleware.configure({});
    consumer
      .apply(
        AppContextMiddleware,
        AuthenticatedMiddleware,
        RateLimitMiddleware,
        CsurfMiddleware,
      )
      .forRoutes(AppController, AccountController, RnippController);

    consumer.apply(CsurfMiddleware).forRoutes(AuthenticationController);

    consumer
      .apply(AppContextMiddleware, TotpMiddleware)
      .forRoutes({ path: '/account/enrollment', method: RequestMethod.PATCH });

    consumer.apply(TotpMiddleware).forRoutes({
      path: '/account/:key',
      method: RequestMethod.DELETE,
    });
    consumer.apply(TotpMiddleware).forRoutes({
      path: '/account/update-account/:username',
      method: RequestMethod.PATCH,
    });
  }
}
