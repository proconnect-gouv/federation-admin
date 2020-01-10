import { Type } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';
import { PersonGenericDTO } from './person-generic.dto';

export class PersonInformation {
  @ValidateNested()
  @Type(() => PersonGenericDTO)
  public requestedIdentity: PersonGenericDTO;

  @ValidateNested()
  @Type(() => PersonGenericDTO)
  public rectifiedIdentity?: PersonGenericDTO;
}
