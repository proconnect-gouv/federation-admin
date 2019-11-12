import { v4 as uuid } from 'uuid';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Citizen } from './citizen.mongodb.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitizenIdentityDTO } from './dto/citizen-identity.dto';
import { CitizenAccountDTO } from './dto/citizen-account.dto';
import { TraceService } from '@fc/shared/logger/trace.service';
import { LogActions } from '@fc/shared/logger/enum/log-actions.enum';

@Injectable()
export class CitizenService {
  constructor(
    @InjectRepository(Citizen, 'fc-mongo')
    private readonly citizenRepository: Repository<Citizen>,
    @Inject('cryptoProvider') private readonly crypto,
    private readonly logger: TraceService,
  ) {}

  async findByHash(hash: string): Promise<Citizen> {
    return await this.citizenRepository.findOne({
      identityHash: hash,
    });
  }

  async setActive(hash, active, supportId, user) {
    const citizen: Citizen = await this.findByHash(hash);
    const accountId =
      citizen && citizen.id ? citizen.id : 'Inconnu.e de Franceconnect.';
    this.logger.supportUserAcountStatus({
      action: !active
        ? LogActions.DESACTIVATE_ACCOUNT
        : LogActions.ACTIVATE_ACCOUNT,
      user: user.username,
      motif: `ticket support : ${supportId}`,
      accountId,
    });

    return this.citizenRepository.save({ ...citizen, active });
  }

  async createBlockedCitizen(citizenIdentity: CitizenIdentityDTO, user) {
    const identityHash = this.getCitizenHash(citizenIdentity);
    const id = this.generateLegacyAccountId();
    const active = false;

    const newCitizen: CitizenAccountDTO = {
      id,
      active,
      identityHash,
    };
    this.logger.supportUserAcountStatus({
      action: LogActions.CREATE_BLOCKED_ACCOUNT,
      user: user.username,
      motif: `ticket support : ${citizenIdentity.supportId}`,
      accountId: newCitizen.id,
    });

    return this.citizenRepository.save(newCitizen);
  }

  getCitizenHash(citizen: CitizenIdentityDTO): string {
    const data = [
      citizen.givenName,
      citizen.familyName,
      citizen.birthdate
        .toISOString()
        .split('T')
        .shift(),
      citizen.gender,
      citizen.birthPlace,
      citizen.birthCountry,
    ].join('');

    return this.crypto
      .createHash('sha256')
      .update(data, 'binary')
      .digest('base64');
  }

  generateLegacyAccountId() {
    return this.crypto
      .createHash('sha256')
      .update(uuid())
      .digest('hex');
  }
}
