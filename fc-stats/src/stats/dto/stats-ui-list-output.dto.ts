import { IsOptional, IsArray } from 'class-validator';
import { StatsDTO } from './stats.dto';
import { MetaDTO } from './meta.dto';

export class StatsUIListOutputDTO {
  @IsOptional()
  @IsArray()
  readonly stats?: StatsDTO[];

  @IsOptional()
  @IsArray()
  readonly meta?: MetaDTO;
}
