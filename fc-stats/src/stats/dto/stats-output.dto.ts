import { IsOptional, IsArray } from 'class-validator';
import { StatsDTO } from './stats.dto';

export class StatsOutputDTO {
  @IsOptional()
  @IsArray()
  readonly stats?: Array<StatsDTO>;
}
