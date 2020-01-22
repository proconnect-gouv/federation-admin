import { Injectable } from '@nestjs/common';

import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { ConfigService } from 'nestjs-config';

@Injectable()
export class MongoService implements MongooseOptionsFactory {
  constructor(private readonly config: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.config.get('mongo-database').url,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }
}
