import {
  IsString,
  IsDateString,
  IsBoolean,
  IsArray,
  IsOptional,
} from 'class-validator';

export class IdpSettingsDTO {
  @IsOptional()
  @IsDateString()
  updatedAt?: Date;

  @IsBoolean()
  isExcludeList: boolean;

  @IsString({ each: true })
  @IsArray()
  list: string[];
}
