import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as flash from 'express-flash';

import 'dotenv';
import { ConfigService } from 'nestjs-config';
import { UnauthorizedExceptionFilter } from '@fc/shared/authentication/filter/UnauthorizedException.filter';
import { PASSPORT } from '@fc/shared/authentication/authentication.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // View engine initialization
  app.engine('ejs', require('ejs').renderFile);
  app.set('views', [
    join(__dirname, '..', 'views'),
    join(__dirname, '../../shared', 'views'),
  ]);
  app.setViewEngine('ejs');

  // Static files
  app.use(express.static('public'));

  // Flash messages
  app.use(flash());

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

  // Redirect to login if unauthorized
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  // Get port from config
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('http').port;

  await app.listen(port);
}
bootstrap();
