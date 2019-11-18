import { v4 as uuid } from 'uuid';
import { CitizenIdentityDTO } from './dto/citizen-identity.dto';
import { Inject } from '@nestjs/common';

export class CitizenServiceBase {
  // tslint:disable-next-line: no-empty
  constructor(@Inject('cryptoProvider') private readonly crypto) {}

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
