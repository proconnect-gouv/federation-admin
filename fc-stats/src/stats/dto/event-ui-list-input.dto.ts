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

export class EventUIListInputDTO {
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

  @IsOptional()
  @IsString()
  readonly action?: string;

  @IsString()
  @IsIn(['day', 'week', 'month', 'year', 'all'])
  readonly granularity?: string = 'month';

  @IsString()
  @IsIn(['list', 'line', 'bar', 'pie'])
  readonly visualize?: string = 'list';

  @IsString()
  @IsIn(['', 'date', 'fi', 'fs', 'fs_label.keyword', 'action', 'typeAction'])
  readonly x?: string = 'date';

  @IsString()
  @IsIn(['date', 'fi', 'fs', 'fs_label.keyword', 'action', 'typeAction'])
  readonly y?: string = 'fs';

  @IsOptional()
  @IsArray()
  @IsIn(['fi', 'fs', 'fs_label.keyword', 'action', 'typeAction'], {
    each: true,
  })
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
