import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvService } from '../env/env.service';

@Injectable()
export class TypeOrmService implements TypeOrmOptionsFactory {
  private readonly env: EnvService;

  public constructor(env: EnvService) {
    this.env = env;
  }
  public createTypeOrmOptions(): TypeOrmModuleOptions {
    const TypeModuleORM: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.env.DB_HOST,
      port: this.env.DB_PORT,
      username: this.env.DB_USERNAME,
      password: this.env.DB_PASSWORD,
      database: this.env.DB_DATABASE,
      synchronize: true,
    };
    return TypeModuleORM;
  }
}
