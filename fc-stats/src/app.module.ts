import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { AppContextMiddleware } from '@fc/shared/app-context/middleware/app-context.middleware';
import { AuthenticationModule } from '@fc/shared/authentication/authentication.module';
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
      .apply(AppContextMiddleware, AuthenticatedMiddleware)
      .forRoutes(AppController);
  }
}
