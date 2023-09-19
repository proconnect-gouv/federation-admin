import { Type } from 'class-transformer';
import { IsString, Matches, ValidateNested } from 'class-validator';
import { PersonGenericDTO } from './person-generic.dto';
import { RnippResponseDTO } from './rnipp-response.dto';
import { RectificationRequestDTO } from './rectification-request.dto';
import { RectifyResponseCodesDTO } from './rectify-response-codes.dto';

export class PersonFoundDTO {
  @IsString()
  public appName: string;

  @ValidateNested()
  @Type(() => PersonGenericDTO)
  public searchResults: RnippResponseDTO[];

  @ValidateNested()
  @Type(() => RectificationRequestDTO)
  public requestedIdentity: RectificationRequestDTO;

  @IsString()
  public csrfToken: string;

  @Matches(/^[0-9]{16}$/)
  @IsString()
  readonly supportId: string;

  @ValidateNested()
  @Type(() => RectifyResponseCodesDTO)
  public readonly rectifyResponseCodes: RectifyResponseCodesDTO;
}
