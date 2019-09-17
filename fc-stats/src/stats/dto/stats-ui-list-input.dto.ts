import {
  IsOptional,
  IsDate,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { FilterParamDTO } from './filter-param.dto';

export class StatsUIListInputDTO {
  @IsOptional()
  @IsDate()
  @Type(
    /* istanbul ignore next */
    () => Date,
  )
  readonly start: Date;

  @IsOptional()
  @IsDate()
  @Type(
    /* istanbul ignore next */
    () => Date,
  )
  readonly stop: Date;

  @IsOptional()
  @IsString()
  readonly action: string;

  @IsOptional()
  @IsString()
  readonly chartList: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(
    /* istanbul ignore next */
    () => FilterParamDTO,
  )
  @Transform(
    /* istanbul ignore next */
    value => value.map(FilterParamDTO.parse),
    { toClassOnly: true },
  )
  readonly filters: FilterParamDTO[];
}
