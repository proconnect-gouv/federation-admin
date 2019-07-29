import { IsInt } from 'class-validator';
import { StatsAPITotalActionInputDTO } from './stats-api-total-action-input.dto';

export class StatsAPITotalActionOutputDTO extends StatsAPITotalActionInputDTO {
  @IsInt()
  readonly count: number;
}
