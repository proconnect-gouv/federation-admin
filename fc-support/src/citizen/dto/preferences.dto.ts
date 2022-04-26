import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IdpSettingsDTO } from './idp-settings.dto';

export class PreferencesDTO {
  @IsOptional()
  @ValidateNested()
  @Type(() => IdpSettingsDTO)
  idpSettings?: IdpSettingsDTO;
}
