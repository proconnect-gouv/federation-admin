import { Type } from 'class-transformer';
import { IsString, Matches, ValidateNested } from 'class-validator';
import { PersonGenericDTO } from './person-generic.dto';
import { PersonInformation } from './person-information.dto';
import { RnippInformation } from './rnipp-information.dto';

export class RnippResponseDTO {
  @ValidateNested()
  @Type(() => PersonInformation)
  public person: PersonInformation;

  @ValidateNested()
  @Type(() => RnippInformation)
  public rnippResponse: RnippInformation;
}
