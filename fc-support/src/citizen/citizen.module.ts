import { Module } from '@nestjs/common';
import { Citizen } from '@fc/shared/citizen/citizen.mongodb.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitizenController } from './citizen.controller';
import { CitizenService } from './citizen.service';
import * as crypto from 'crypto';
import {
  UserPreferencesModule,
  UserPreferencesService,
} from '@fc/shared/user-preferences';

const cryptoProvider = {
  provide: 'cryptoProvider',
  useValue: crypto,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Citizen], 'fc-mongo'),
    UserPreferencesModule.registerFor('preferences'),
  ],
  controllers: [CitizenController],
  providers: [CitizenService, cryptoProvider, UserPreferencesService],
  exports: [CitizenService, cryptoProvider],
})
export class CitizenModule {}
