import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CsurfMiddleware } from '@nest-middlewares/csurf';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { AppContextMiddleware } from '@fc/shared/app-context/middleware/app-context.middleware';
import { AuthenticationModule } from '@fc/shared/authentication/authentication.module';
import { AuthenticationController } from '@fc/shared/authentication/authentication.controller';
import { AuthenticatedMiddleware } from '@fc/shared/authentication/middleware/authenticated.middleware';
import { StatsModule } from './stats/stats.module';
import { LocalsInterceptor } from './meta/locals.interceptor';

@Module({
  imports: [
    AuthenticationModule,
    ConfigModule.load(resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
    StatsModule,
  ],
  providers: [LocalsInterceptor],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      .apply(AppContextMiddleware, AuthenticatedMiddleware, CsurfMiddleware)
      .forRoutes(AppController);

    consumer.apply(CsurfMiddleware).forRoutes(AuthenticationController);
  }
}
