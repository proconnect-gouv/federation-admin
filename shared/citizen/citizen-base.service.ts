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
      this.rectifyIfPartialBirthdate(pivotIdentity.birthdate),
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

  /**
   * If the birthdate argument does not contain any day and/or any month,
   * set the day and/or the month to "01"
   * @param birthdate a birthdate to format "YYYY" / "YYYY-MM" / "YYYY-MM-DD"
   * @returns a birthdate to format "YYYY-MM-DD"
   */
  private rectifyIfPartialBirthdate(birthdate: string): string {
    if (birthdate.match(/^[0-9]{4}$/)) {
      return `${birthdate}-01-01`;
    } else if (birthdate.match(/^[0-9]{4}-[0-9]{2}$/)) {
      return `${birthdate}-01`;
    }

    return birthdate;
  }
}
