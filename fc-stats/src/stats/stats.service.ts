import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchParams, SearchResponse } from 'elasticsearch';
import { plainToClass } from 'class-transformer';
import { StatsDTO } from './dto/stats.dto';
import { StatsQueries } from './stats.queries';
import { StatsServiceParams } from './interfaces/stats-service-params.interface';
import { TotalByFIWeek } from './interfaces/total-by-fi-response.interface';
@Injectable()
export class StatsService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly statsQueries: StatsQueries,
  ) {}

  async getEvents(params: StatsServiceParams): Promise<StatsDTO[]> {
    const query: SearchParams = this.statsQueries.getEvents(params);
    const data: SearchResponse<
      any
    > = await this.elasticsearchService.getClient().search(query);
    const esResponse: StatsDTO[] = this.getItems(data);

    return esResponse;
  }

  private getItems(response: SearchResponse<any>): StatsDTO[] {
    return response.hits.hits.map(item =>
      plainToClass(StatsDTO, { id: item._id, ...item._source }),
    );
  }

  async getTotalByActionAndRange(params: StatsServiceParams): Promise<number> {
    const { action } = params;
    const query: SearchParams = this.statsQueries.getTotalByActionAndRange(
      params,
    );
    const data: SearchResponse<
      any
    > = await this.elasticsearchService.getClient().search(query);

    return data.aggregations[action].value;
  }

  async getTotalForActionsAndFiAndRangeByWeek(
    params: StatsServiceParams,
  ): Promise<TotalByFIWeek[]> {
    const query: SearchParams = this.statsQueries.getTotalForActionsAndFiAndRangeByWeek(
      params,
    );
    const data: SearchResponse<
      any
    > = await this.elasticsearchService.getClient().search(query);

    const weeks: TotalByFIWeek[] = data.aggregations.week.buckets.map(week => ({
      startDate: week.key,
      events: week.action.buckets.map(event => ({
        label: event.key,
        count: event.count.value,
      })),
    }));

    return weeks;
  }
}
