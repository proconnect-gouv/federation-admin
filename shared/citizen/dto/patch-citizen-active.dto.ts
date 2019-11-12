import { CitizenIdentityDTO } from './citizen-identity.dto';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean } from '@fc/shared/transforms/string.transform';

export class PatchCitizenActiveDTO extends CitizenIdentityDTO {
  @IsBoolean()
  @Transform(toBoolean)
  active: boolean;
}
