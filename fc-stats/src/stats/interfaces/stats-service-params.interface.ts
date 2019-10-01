import { FilterParamDTO } from '../dto/filter-param.dto';

export interface StatsServiceParams {
  columns: string[];
  start: Date;
  stop: Date;
  action?: string;
  fi?: string;
  filters?: FilterParamDTO[];
  page?: number;
  limit?: number;
  visualize?: string;
  granularity?: string;
}
