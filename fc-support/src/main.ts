import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { config } from 'dotenv';

async function bootstrap() {
  config({ path: join(process.cwd(), '.env') });
  const server: INestApplication = await NestFactory.create(AppModule);

  // CORS
  server.enableCors();

  // Improve security
  server.use(require('helmet')());

  // improve performance
  server.use(require('compression')());

  // enable cokkie
  server.use(require('cookie-parser')());

  //enable json response
  server.use(require('body-parser').urlencoded({ extended: true }));
  server.use(require('body-parser').json());

  await server.listen(process.env.PORT, '0.0.0.0');
}
bootstrap();
