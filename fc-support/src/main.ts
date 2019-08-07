import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as flash from 'express-flash';
import * as helmet from 'helmet';
import * as Bundler from 'parcel-bundler';

import 'dotenv';
import { ConfigService } from 'nestjs-config';
import { UnauthorizedExceptionFilter } from '@fc/shared/authentication/filter/UnauthorizedException.filter';
import { PASSPORT } from '@fc/shared/authentication/authentication.module';
import { LocalsInterceptor } from './meta/locals.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // View engine initialization
  app.engine('ejs', require('ejs').renderFile);
  app.set('views', [join(__dirname, '..', 'views')]);
  app.setViewEngine('ejs');

  // Static files
  app.use(express.static('public'));

  // Flash messages
  app.use(flash());

  // Helmet
  app.use(helmet());

  // Sessions initialization
  app.use(
    session({
      secret: "le père Noël n'existe pas",
      name: 'sessionId',
      resave: true,
      saveUninitialized: false,
    }),
  );
  app.use(cookieParser());

  // Passport initialization
  const passport = app.get(PASSPORT);
  app.use(passport.initialize());
  app.use(passport.session());

  // Cors
  // app.use(cors);

  // Get port from config
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('http').port;

  // Redirect to login if unauthorized
  app.useGlobalFilters(
    new UnauthorizedExceptionFilter(configService.get('app').app_root),
  );

  // Setup locals for all the routes
  const localsInterceptor = app.get<LocalsInterceptor>(LocalsInterceptor);
  app.useGlobalInterceptors(localsInterceptor);

  // Setup assets bundling
  const file = join(__dirname, '..', 'public/javascript/main.js');
  const bundler = new Bundler(file, {
    outDir: './dist/client/',
  });
  app.use(bundler.middleware());

  await app.listen(port);
}
bootstrap();
