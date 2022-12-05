import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import { Citizen } from '@fc/shared/citizen/citizen.mongodb.entity';
import { IPivotIdentity } from '@fc/shared/citizen/interfaces/pivot-identity.interface';
import { LoggerService } from '@fc/shared/logger/logger.service';
import {
  IFormattedIdpSettings,
  UserPreferencesService,
} from '@fc/shared/user-preferences';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    const rnippIdentityWithNormalizedBirthdateIdentity = {
      ...rnippIdentity,
      birthdate: this.rectifyIfPartialBirthdate(rnippIdentity.birthdate),
    };

    const identity = this.generateOIDCIdentity(
      rnippIdentityWithNormalizedBirthdateIdentity,
    );

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
