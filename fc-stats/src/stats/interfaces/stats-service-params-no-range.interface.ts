import { FilterParamDTO } from '../dto/filter-param.dto';

export interface StatsServiceParamsNoRange {
  action?: string;
  fi?: string;
  filters?: FilterParamDTO[];
  page?: number;
  limit?: number;
}
