import {
  IsIn,
  IsString,
  Matches,
  IsOptional,
  IsISO8601,
} from 'class-validator';

const NAME_REGEX = /^[a-zA-Zàâéêèëîïôùç]+([\ \-][a-zA-Zàâéêèëîïôùç]+)*$/;

export class PersonGenericDTO {
  @IsIn(['male', 'female'])
  @IsString()
  readonly gender: string;

  @Matches(NAME_REGEX)
  @IsString()
  readonly familyName: string;

  @IsOptional()
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
