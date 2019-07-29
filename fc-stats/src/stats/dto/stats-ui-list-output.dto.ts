import { IsOptional, IsArray } from 'class-validator';
import { StatsDTO } from './stats.dto';

export class StatsUIListOutputDTO {
  @IsOptional()
  @IsArray()
  readonly stats?: StatsDTO[];
}
