import {
  IsOptional,
  IsDate,
  IsString,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { FilterParamDTO } from './filter-param.dto';

export class MetricUIListInputDTO {
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
  @Type(
    /* istanbul ignore next */
    () => Number,
  )
  readonly limit?: number = 10;

  @IsOptional()
  @Type(
    /* istanbul ignore next */
    () => Number,
  )
  readonly page?: number = 0;

  @IsString()
  @IsIn(['day', 'week', 'month', 'year', 'all'])
  readonly granularity?: string = 'day';

  @IsString()
  @IsIn(['list', 'line', 'bar', 'pie'])
  readonly visualize?: string = 'list';

  @IsString()
  readonly x?: string = 'date';

  @IsString()
  readonly y?: string = 'value';

  @IsOptional()
  @IsArray()
  @IsIn(['key', 'range'], { each: true })
  readonly columns: string[] = ['key', 'range'];

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
  readonly filters?: FilterParamDTO[];
}
