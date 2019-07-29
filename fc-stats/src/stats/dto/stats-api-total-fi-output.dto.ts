import { IsArray } from 'class-validator';
import { StatsAPITotalFIInputDTO } from './stats-api-total-fi-input.dto';

export class StatsAPITotalFIOutputDTO extends StatsAPITotalFIInputDTO {
  @IsArray()
  readonly weeks: any[];
}
