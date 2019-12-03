import { IsIn, IsString, Matches, IsISO8601 } from 'class-validator';
import { IsOptionalExtended } from '../../validators/is-optional-extended.validator';

const NAME_REGEX = /^[a-zA-ZÀÂÉÊÈËÎÏÔÙÇàâéêèëîïôùç]+([\ \-][a-zA-ZÀÂÉÊÈËÎÏÔÙÇàâéêèëîïôùç]+)*$/;

export class PersonGenericDTO {
  @IsIn(['male', 'female'])
  @IsString()
  readonly gender: string;

  @Matches(NAME_REGEX)
  @IsString()
  readonly familyName: string;

  @IsOptionalExtended()
  @Matches(NAME_REGEX)
  @IsString()
  readonly preferredUsername: string;

  @Matches(NAME_REGEX)
  @IsString()
  readonly givenName: string;

  @IsISO8601()
  readonly birthdate: string;

  @Matches(/^[0-9]{5}$/)
  @IsString()
  readonly birthPlace: string;

  @Matches(/^[0-9]{5}$/)
  @IsString()
  readonly birthCountry: string;

  @Matches(/^[0-9]{16}$/)
  @IsString()
  readonly supportId: string;
}
