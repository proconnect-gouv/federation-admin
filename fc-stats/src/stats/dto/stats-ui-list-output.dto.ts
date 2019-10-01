import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { StatsUIListInputDTO } from './stats-ui-list-input.dto';
import { StatsDTO } from './stats.dto';
import { MetaDTO } from './meta.dto';

export class StatsUIListOutputDTO {
  @ValidateNested()
  readonly params: StatsUIListInputDTO;

  @IsOptional()
  @IsArray()
  readonly stats?: StatsDTO[];

  @IsOptional()
  @IsArray()
  readonly meta?: MetaDTO;
}
