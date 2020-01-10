import { IPivotIdentity } from './citizen-identity.dto';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean } from '@fc/shared/transforms/string.transform';

export class PatchCitizenActiveDTO extends IPivotIdentity {
  @IsBoolean()
  @Transform(toBoolean)
  active: boolean;
}
