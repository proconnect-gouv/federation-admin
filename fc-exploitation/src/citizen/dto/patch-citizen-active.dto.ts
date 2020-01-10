import { RectificationRequestDTO } from '@fc/shared/rnipp/dto/rectification-request.dto';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean } from '@fc/shared/transforms/string.transform';

export class PatchCitizenActiveDTO extends RectificationRequestDTO {
  @IsBoolean()
  @Transform(toBoolean)
  active: boolean;
}
