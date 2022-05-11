import { Type } from 'class-transformer';
import { ValidateNested, IsString, Matches } from 'class-validator';
import { RnippInformation } from './rnipp-information.dto';
import { PersonInformation } from './person-information.dto';

export class PersonFoundDTO {
  @IsString()
  public appName: string;

  @IsString()
  public instanceFor: string;

  @ValidateNested()
  @Type(() => PersonInformation)
  public person: PersonInformation;

  @ValidateNested()
  @Type(() => RnippInformation)
  public rnippResponse: RnippInformation;

  @IsString()
  public csrfToken: string;

  @Matches(/^[0-9]{16}$/)
  @IsString()
  readonly supportId: string;
}
