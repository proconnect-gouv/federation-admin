import { Module } from '@nestjs/common';
import { Citizen } from './citizen.mongodb.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitizenController } from './citizen.controller';
import { CitizenService } from './citizen.service';
import { TraceService } from '@fc/shared/logger/trace.service';
import * as crypto from 'crypto';

const cryptoProvider = {
  provide: 'cryptoProvider',
  useValue: crypto,
};

@Module({
  imports: [TypeOrmModule.forFeature([Citizen], 'fc-mongo')],
  controllers: [CitizenController],
  providers: [CitizenService, cryptoProvider, TraceService],
  exports: [CitizenService, cryptoProvider],
})
export class CitizenModule {}
