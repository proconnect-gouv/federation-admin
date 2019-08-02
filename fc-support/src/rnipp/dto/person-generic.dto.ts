import {
  IsIn,
  IsString,
  Matches,
  IsOptional,
  IsISO8601,
} from 'class-validator';

export class PersonGenericDTO {
  @IsIn(['male', 'female'])
  @IsString()
  readonly gender: string;

  @Matches(/^[a-zA-Z]+(-[a-zA-Z]+)*( [a-zA-Z\-]+)*$/)
  @IsString()
  readonly familyName: string;

  @IsOptional()
  @Matches(/^[a-zA-Z]+(-[a-zA-Z]+)*( [a-zA-Z\-]+)*$/)
  @IsString()
  readonly preferredUsername: string;

  @Matches(/^[a-zA-Z]+(-[a-zA-Z]+)*( [a-zA-Z\-]+)*$/)
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
}
