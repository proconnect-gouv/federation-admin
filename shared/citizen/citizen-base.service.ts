import { v4 as uuid } from 'uuid';
import { IPivotIdentity } from './interfaces/pivot-identity.interface';
import { ILegacyPivotIdentity } from './interfaces/legacy-identity-pivot.interface';
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

    /**
     * The "update" function default encoding was "binary" in NodeJS V4 when FranceConnect was starting
     * Since changing it would cause people identity hash to change, we need to keep it as it
     * @see https://nodejs.org/docs/latest-v4.x/api/crypto.html#crypto_hash_update_data_input_encoding
     */
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

  generateOIDCIdentity(rnippIdentity: IPivotIdentity): ILegacyPivotIdentity {
    return {
      given_name: rnippIdentity.givenName,
      family_name: rnippIdentity.familyName,
      birthdate: rnippIdentity.birthdate,
      gender: rnippIdentity.gender,
      birthcountry: rnippIdentity.birthCountry,
      birthplace: rnippIdentity.birthPlace,
    };
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
