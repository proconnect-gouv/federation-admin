import { v4 as uuid } from 'uuid';
import { IPivotIdentity } from './interfaces/pivot-identity.interface';
import { Inject } from '@nestjs/common';

export class CitizenServiceBase {
  // tslint:disable-next-line: no-empty
  constructor(@Inject('cryptoProvider') private readonly crypto) {}

  getPivotIdentityHash(pivotIdentity: IPivotIdentity): string {
    const data = [
      pivotIdentity.givenName,
      pivotIdentity.familyName,
      pivotIdentity.birthdate,
      pivotIdentity.gender,
      pivotIdentity.birthPlace,
      pivotIdentity.birthCountry,
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
