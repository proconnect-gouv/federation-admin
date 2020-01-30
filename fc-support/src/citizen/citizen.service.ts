import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Citizen } from './citizen.mongodb.entity';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';

@Injectable()
export class CitizenService extends CitizenServiceBase {
  constructor(
    @InjectRepository(Citizen, 'fc-mongo')
    private readonly citizenRepository: Repository<Citizen>,
    @Inject('cryptoProvider') crypto,
  ) {
    super(crypto);
  }

  async findByHash(hash: string): Promise<Citizen> {
    return await this.citizenRepository.findOne({
      identityHash: hash,
    });
  }
}
