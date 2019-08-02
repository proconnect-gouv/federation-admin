import { IsString, IsISO8601, Matches, IsIn } from 'class-validator';

import { ValidationOptions, ValidateIf } from 'class-validator';

export class PersonRequestedDTO {
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

function IsOptional(validationOptions?: ValidationOptions) {
  return ValidateIf((obj, value) => {
    return value !== null && value !== undefined && value !== '';
  }, validationOptions);
}
