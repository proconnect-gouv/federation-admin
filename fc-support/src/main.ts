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
import * as methodOverride from 'method-override';

import 'dotenv';
import { ConfigService } from 'nestjs-config';
import { PASSPORT } from '@fc/shared/authentication/authentication.module';
import { LocalsInterceptor } from './meta/locals.interceptor';
import { RolesGuard } from '@fc/shared/authentication/guard/roles.guard';
import { AllExceptionFilter } from '@fc/shared/exception/filter/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  // View engine initialization
  app.engine('ejs', require('ejs').renderFile);
  app.set('views', [
    join(__dirname, '..', 'views'),
    join(__dirname, '../../shared', 'views'),
  ]);
  app.setViewEngine('ejs');

  // Static files
  app.use(express.static('dist/client'));

  // override http method
  app.use(methodOverride('_method'));

  // Flash messages
  app.use(flash());

  // Helmet
  app.use(helmet());

  // Sessions initialization
  app.use(session(configService.get('session')));

  app.use(cookieParser());

  // Passport initialization
  const passport = app.get(PASSPORT);
  app.use(passport.initialize());
  app.use(passport.session());

  // Cors
  // app.use(cors);

  // Get port from config
  const port = configService.get('http').port;

  // Catch http exception
  app.useGlobalFilters(new AllExceptionFilter(configService.get('app')));

  // Setup locals for all the routes
  const localsInterceptor = app.get<LocalsInterceptor>(LocalsInterceptor);
  app.useGlobalInterceptors(localsInterceptor);

  // Setup roles-based security
  const rolesGuard = app.get<RolesGuard>(RolesGuard);
  app.useGlobalGuards(rolesGuard);

  await app.listen(port);
}
bootstrap();
