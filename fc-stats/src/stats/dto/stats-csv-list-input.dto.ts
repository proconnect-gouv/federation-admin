import { IsDate, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { FilterParamDTO } from './filter-param.dto';

export class StatsCSVListInputDTO {
  @IsDate()
  @Type(
    /* istanbul ignore next */
    () => Date,
  )
  readonly start: Date;

  @IsDate()
  @Type(
    /* istanbul ignore next */
    () => Date,
  )
  readonly stop: Date;

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
