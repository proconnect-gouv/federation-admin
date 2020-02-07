import { IsString, IsISO8601, Matches, IsIn, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsOptionalExtended } from '../../validators/is-optional-extended.validator';
import { IsValidInputString } from '../../validators/is-valid-input-string';
import { toBoolean } from '../../transforms/string.transform';
import { IIdentity } from '../../citizen/interfaces/identity.interface';
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

  @IsISO8601()
  readonly birthdate: string;

  @IsBoolean()
  @Transform(toBoolean)
  readonly isFrench: boolean;

  @Matches(/^[0-9]{5}$/)
  @IsString()
  readonly cog: string;

  public toIdentity(): IIdentity {
    return {
      gender: this.gender,
      familyName: this.familyName,
      preferredUsername: this.preferredUsername,
      givenName: this.givenName,
      birthdate: this.birthdate,
      birthCountry: this.isFrench ? FRANCE_COG : this.cog,
      birthPlace: this.isFrench ? this.cog : '',
    };
  }
}
