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

    const stats: StatsDTO[] = StatsService.aggregationsToDocuments(
      params,
      data.aggregations,
    );

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
      params,
      stats,
      meta,
    };
  }

  static aggregationsToDocuments(
    params: StatsServiceParams,
    aggregations: SearchResponse<any>,
  ): StatsDTO[] {
    const fields = params.columns.concat(['count']);
    const docs = [];

    StatsService.fetchSubAggregation(docs, aggregations, {}, 'date', fields);

    return docs.map(item => plainToClass(StatsDTO, item));
  }

  static fetchSubAggregation(docs, data, doc, field, fields: string[]) {
    const localFields = Array.from(fields);
    const childField: string = localFields.shift();

    if (childField) {
      data[field].buckets.forEach(bucket => {
        doc[field] = bucket.key_as_string || bucket.key;
        const rs = StatsService.fetchSubAggregation(
          docs,
          bucket,
          doc,
          childField,
          localFields,
        );
      });
    } else {
      doc[field] = data.count.value;
      docs.push({ ...doc });
      doc = {};
    }
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
