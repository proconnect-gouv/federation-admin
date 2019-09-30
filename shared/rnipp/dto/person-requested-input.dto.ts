import {
  IsString,
  IsISO8601,
  Matches,
  IsIn,
  ValidationOptions,
  ValidateIf,
} from 'class-validator';

const NAME_REGEX = /^[a-zA-Zàâéêèëîïôùç]+([\ \-][a-zA-Zàâéêèëîïôùç]+)*$/;

export class PersonRequestedDTO {
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

function IsOptional(validationOptions?: ValidationOptions) {
  return ValidateIf((obj, value) => {
    return value !== null && value !== undefined && value !== '';
  }, validationOptions);
}
