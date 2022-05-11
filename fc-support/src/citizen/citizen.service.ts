import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Citizen } from '@fc/shared/citizen/citizen.mongodb.entity';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import {
  UserPreferencesService,
  IFormattedIdpSettings,
} from '@fc/shared/user-preferences';
import { IPivotIdentity } from '@fc/shared/citizen/interfaces/pivot-identity.interface';
import { LoggerService } from '@fc/shared/logger/logger.service';

@Injectable()
export class CitizenService extends CitizenServiceBase {
  constructor(
    @InjectRepository(Citizen, 'fc-mongo')
    private readonly citizenRepository: Repository<Citizen>,
    @Inject('cryptoProvider') crypto,
    private readonly broker: UserPreferencesService,
    private readonly logger: LoggerService,
  ) {
    super(crypto);
  }

  async findByHash(hash: string): Promise<Citizen> {
    return await this.citizenRepository.findOne({
      identityHash: hash,
    });
  }

  async findIdpPreferences(
    rnippIdentity: IPivotIdentity,
  ): Promise<IFormattedIdpSettings> {
    const identity = this.generateOIDCIdentity(rnippIdentity);
    // get user preferences with the specific broker
    let userIdpSettings;
    try {
      userIdpSettings = await this.broker.publish('GET_IDP_SETTINGS', {
        identity,
      });
    } catch (error) {
      this.logger.error('Preferences Broker error: ' + error);
    }
    return userIdpSettings;
  }
}
