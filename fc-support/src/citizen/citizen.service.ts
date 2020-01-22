import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Citizen } from './citizen.mongodb.entity';
import { CitizenAccountDTO } from './dto/citizen-account.dto';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import { LogActions } from '@fc/shared/logger/enum/log-actions.enum';
import { TraceService } from '@fc/shared/logger/trace.service';
import { IIdentity } from '@fc/shared/citizen/interfaces/identity.interface';

@Injectable()
export class CitizenService extends CitizenServiceBase {
  constructor(
    @InjectRepository(Citizen, 'fc-mongo')
    private readonly citizenRepository: Repository<Citizen>,
    @Inject('cryptoProvider') crypto,
    private readonly logger: TraceService,
  ) {
    super(crypto);
  }

  async findByHash(hash: string): Promise<Citizen> {
    return await this.citizenRepository.findOne({
      identityHash: hash,
    });
  }
}
