import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { static as expressStatic, urlencoded } from 'express';
import * as flash from 'express-flash';
import * as helmet from 'helmet';
import * as methodOverride from 'method-override';

import 'dotenv';
import { ConfigService } from 'nestjs-config';
import { PASSPORT } from '@fc/shared/authentication/authentication.module';
import { LocalsInterceptor } from './meta/locals.interceptor';
import { RolesGuard } from '@fc/shared/authentication/guard/roles.guard';
import { AllExceptionFilter } from '@fc/shared/exception/filter/all-exception.filter';
import { LoggerService } from '@fc/shared/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });

  /**
   * We can't set the query parser to "simple" because we use the complex parsing.
   */

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const configService = app.get<ConfigService>(ConfigService);

  // View engine initialization
  app.engine('ejs', require('ejs').renderFile);
  app.set('views', [
    join(__dirname, '..', 'views'),
    join(__dirname, '../../shared', 'views'),
  ]);
  app.setViewEngine('ejs');

  // Trust first proxy (needed for secure cookies)
  // @see https://www.npmjs.com/package/express-session#cookiesecure
  app.set('trust proxy', 1);

  // Static files
  app.use(expressStatic('dist/client'));

  // override http method
  app.use(methodOverride('_method'));

  // Flash messages
  app.use(flash());

  // Helmet
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        'img-src': ["'self'", 'data:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    }),
  );
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

  app.use(urlencoded({ extended: false }));

  // Sessions initialization
  app.use(session(configService.get('session')));

  app.use(cookieParser());

  // Passport initialization
  const passport = app.get(PASSPORT);
  app.use(passport.initialize());
  app.use(passport.session());

  // Catch http exception
  app.useGlobalFilters(
    new AllExceptionFilter(configService.get('app'), logger),
  );

  // Get port from config
  const port = configService.get('http').port;

  // Setup locals for all the routes
  const localsInterceptor = app.get<LocalsInterceptor>(LocalsInterceptor);
  app.useGlobalInterceptors(localsInterceptor);

  // Setup roles-based security
  const rolesGuard = app.get<RolesGuard>(RolesGuard);
  app.useGlobalGuards(rolesGuard);

  await app.listen(port);
}

bootstrap();
