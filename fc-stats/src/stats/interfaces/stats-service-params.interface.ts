import { FilterParamDTO } from '../dto/filter-param.dto';

export interface StatsServiceParams {
  start: Date;
  stop: Date;
  action?: string;
  fi?: string;
  filters?: FilterParamDTO[];
}
