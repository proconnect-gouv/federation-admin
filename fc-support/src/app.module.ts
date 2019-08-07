import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { AppContextMiddleware } from '@fc/shared/app-context/middleware/app-context.middleware';
import { AuthenticationModule } from '@fc/shared/authentication/authentication.module';
import { AuthenticatedMiddleware } from '@fc/shared/authentication/middleware/authenticated.middleware';
import { RnippModule } from './rnipp/rnipp.module';
import { RnippController } from './rnipp/rnipp.controller';
import { LocalsInterceptor } from './meta/locals.interceptor';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { CsurfMiddleware } from '@nest-middlewares/csurf';

@Module({
  imports: [
    AuthenticationModule,
    RnippModule,
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
  ],
  providers: [LocalsInterceptor],
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
      .forRoutes(AppController, RnippController);
  }
}
