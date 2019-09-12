import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchParams, SearchResponse } from 'elasticsearch';
import * as ElasticsearchScrollStream from 'elasticsearch-scroll-stream';
import { Readable } from 'stream';
import { plainToClass } from 'class-transformer';
import { StatsDTO } from '../dto/stats.dto';
import { StatsQueries } from '../stats.queries';
import { StatsServiceParams } from '../interfaces/stats-service-params.interface';
import { TotalByFIWeek } from '../interfaces/total-by-fi-response.interface';
import { StatsUIListOutputDTO } from '../dto/stats-ui-list-output.dto';
import { MetaDTO } from '../dto/meta.dto';
@Injectable()
export class StatsService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly statsQueries: StatsQueries,
  ) {}

  streamEvents(params: StatsServiceParams): Readable {
    const query: SearchParams = this.statsQueries.streamEvents(params);
    const client = this.elasticsearchService.getClient();
    const streamConfig = { objectMode: true };

    const stream: Readable = new ElasticsearchScrollStream(
      client,
      query,
      [],
      streamConfig,
    );

    return stream;
  }

  async getEvents(params: StatsServiceParams): Promise<StatsUIListOutputDTO> {
    const query: SearchParams = this.statsQueries.getEvents(params);
    const data: SearchResponse<
      any
    > = await this.elasticsearchService.getClient().search(query);

    const esResponse: StatsDTO[] = this.getItems(data);

    /** Get filters menu data */
    const total = data.hits.total;
    const fsList = this.getAggregate(data, 'fs');
    const fiList = this.getAggregate(data, 'fi');
    const actionList = this.getAggregate(data, 'action');
    const typeActionList = this.getAggregate(data, 'typeAction');

    const meta: MetaDTO = {
      total,
      fsList,
      fiList,
      actionList,
      typeActionList,
    };
    return {
      stats: esResponse,
      meta,
    };
  }

  private getItems(response: SearchResponse<any>): StatsDTO[] {
    return response.hits.hits.map(item =>
      plainToClass(StatsDTO, { id: item._id, ...item._source }),
    );
  }

  // Get FI, FS, Action, Type Action list
  private getAggregate(
    response: SearchResponse<any>,
    aggregateName: string,
  ): string[] {
    const aggregation = response.aggregations[aggregateName];
    let aggregateKeys: string[] = [];
    aggregateKeys = aggregation.buckets;
    return aggregateKeys;
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
