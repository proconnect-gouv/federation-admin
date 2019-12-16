import { IsString, IsDateString } from 'class-validator';

export class CitizenAccountDTO {
  @IsString()
  // Native MongoDB column name
  // tslint:disable-next-line: variable-name
  _id?: string;

  @IsString()
  id: string;

  @IsString()
  identityHash: string;

  @IsString()
  // App does not need to handle federationKey for the moment,
  // so let's just type it as "any"
  federationKeys?: any[] = [];

  @IsString()
  // App does not need to handle servicesProvidersFederationKeys for the moment,
  // so let's just type it as "any"
  servicesProvidersFederationKeys?: any[] = [];

  @IsString()
  active: boolean;

  @IsString()
  noDisplayConfirmation?: boolean = false;

  @IsDateString()
  createdAt?: Date;

  @IsDateString()
  updatedAt?: Date;

  @IsDateString()
  lastConnection?: Date;
}
