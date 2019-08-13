import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from '@nestjs/common';
import { SortParamDTO } from './stats-api-sort-param.dto';
import { Transform } from 'stream';

export class StatsUIListInputDTO {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortParamDTO)
  @Transform(value => value.map(SortParamDTO.parse), { toClassOnly: true })
  sort: SortParamDTO[];
}
