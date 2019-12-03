import { IsString, IsISO8601, Matches, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsOptionalExtended } from '../../validators/is-optional-extended.validator';

const NAME_REGEX = /^[a-zA-ZÀÂÉÊÈËÎÏÔÙÇàâéêèëîïôùç]+([\ \-][a-zA-ZÀÂÉÊÈËÎÏÔÙÇàâéêèëîïôùç]+)*$/;

export class PersonRequestedDTO {
  @IsIn(['male', 'female'])
  @IsString()
  readonly gender: string;

  @Matches(NAME_REGEX)
  @IsString()
  @Transform(value => typeof value === 'string' && value.toUpperCase())
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
