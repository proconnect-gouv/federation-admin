import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SortParamDTO } from './stats-api-sort-param.dto';

export class StatsUIListInputDTO {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortParamDTO)
  @Transform(value => value.map(SortParamDTO.parse), { toClassOnly: true })
  sort: SortParamDTO[];
}
