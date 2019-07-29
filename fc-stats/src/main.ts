import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as flash from 'express-flash';
import * as Bundler from 'parcel-bundler';

import 'dotenv';
import { ConfigService } from 'nestjs-config';
import { UnauthorizedExceptionFilter } from '@fc/shared/authentication/filter/UnauthorizedException.filter';
import { PASSPORT } from '@fc/shared/authentication/authentication.module';
import { LocalsInterceptor } from './meta/locals.interceptor';
import { RolesGuard } from '@fc/shared/authentication/guard/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  // View engine initialization
  app.engine('ejs', require('ejs').renderFile);
  app.set('views', [join(__dirname, '..', 'views')]);
  app.setViewEngine('ejs');

  // Static files
  app.use(express.static('public'));

  // Flash messages
  app.use(flash());

  // Sessions initialization
  app.use(session(configService.get('session')));

  app.use(cookieParser());

  // Passport initialization
  const passport = app.get(PASSPORT);
  app.use(passport.initialize());
  app.use(passport.session());

  // Redirect to login if unauthorized
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  // Get port from config
  const port = configService.get('http').port;

  // Setup locals for all the routes
  const localsInterceptor = app.get<LocalsInterceptor>(LocalsInterceptor);
  app.useGlobalInterceptors(localsInterceptor);

  // Setup assets bundling
  const file = join(__dirname, '..', 'public/javascript/main.js');
  const bundler = new Bundler(file, {
    outDir: './dist/client/',
  });
  app.use(bundler.middleware());

  // Setup roles-based security
  const rolesGuard = app.get<RolesGuard>(RolesGuard);
  app.useGlobalGuards(rolesGuard);

  await app.listen(port);
}

bootstrap();
