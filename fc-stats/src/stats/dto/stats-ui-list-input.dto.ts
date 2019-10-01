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
  @Type(() => Number)
  readonly limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  readonly page?: number = 0;

  @IsOptional()
  @IsString()
  readonly action?: string;

  @IsString()
  @IsIn(['day', 'week', 'month', 'year', 'all'])
  readonly granularity?: string = 'day';

  @IsString()
  @IsIn(['list', 'line', 'bar', 'pie'])
  readonly visualize?: string = 'list';

  @IsString()
  @IsIn(['', 'date', 'fi', 'fs', 'action', 'typeAction'])
  readonly x?: string = 'date';

  @IsString()
  @IsIn(['date', 'fi', 'fs', 'action', 'typeAction'])
  readonly y?: string = 'fs';

  @IsOptional()
  @IsArray()
  @IsIn(['fi', 'fs', 'action', 'typeAction'], { each: true })
  readonly columns: string[] = ['fi', 'action'];

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
