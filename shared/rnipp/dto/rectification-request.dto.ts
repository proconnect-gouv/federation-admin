/* istanbul ignore file */

// Declarative code
import { IsString, Matches, IsIn, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBirthdate } from '../validator/is-birthdate.validator';
import { IsOptionalExtended } from '../../validators/is-optional-extended.validator';
import { IsValidInputString } from '../../validators/is-valid-input-string';
import { toBoolean } from '../../transforms/string.transform';
import { IIdentity } from '../../citizen/interfaces/identity.interface';
import { IOidcIdentity } from '../../citizen/interfaces/oidc-identity.interface';
import { FRANCE_COG } from '../rnipp-constants';

export class RectificationRequestDTO {
  @Matches(/^[0-9]{16}$/)
  @IsString()
  readonly supportId: string;

  @IsIn(['male', 'female'])
  @IsString()
  readonly gender: string;

  @IsValidInputString()
  @IsString()
  @Transform(value => typeof value === 'string' && value.toUpperCase())
  readonly familyName: string;

  @IsOptionalExtended()
  @IsValidInputString()
  @IsString()
  readonly preferredUsername: string;

  @IsValidInputString()
  @IsString()
  readonly givenName: string;

  @IsBirthdate()
  @IsString()
  readonly birthdate: string;

  @IsBoolean()
  @Transform(toBoolean)
  readonly isFrench: boolean;

  @Matches(/^(?:2[AB]|[0-9]{2})[0-9]{3}$/)
  @IsString()
  readonly cog: string;

  public toIdentity(): IIdentity {
    return {
      gender: this.gender,
      familyName: this.familyName,
      preferredUsername: this.preferredUsername,
      givenName: this.givenName,
      birthdate: this.rectifyIfPartialBirthdate(this.birthdate),
      birthCountry: this.isFrench ? FRANCE_COG : this.cog,
      birthPlace: this.isFrench ? this.cog : '',
    };
  }

  public toOidc(): IOidcIdentity {
    return {
      gender: this.gender,
      family_name: this.familyName,
      preferred_username: this.preferredUsername,
      given_name: this.givenName,
      birthdate: this.rectifyIfPartialBirthdate(this.birthdate),
      birthcountry: this.isFrench ? FRANCE_COG : this.cog,
      birthplace: this.isFrench ? this.cog : '',
    };
  }

  private rectifyIfPartialBirthdate(birthdate: string): string {
    if (birthdate.match(/^[0-9]{4}$/)) {
      return `${birthdate}-01-01`;
    } else if (birthdate.match(/^[0-9]{4}-[0-9]{2}$/)) {
      return `${birthdate}-01`;
    }

    return birthdate;
  }
}
