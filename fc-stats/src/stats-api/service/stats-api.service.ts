import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { plainToClass } from 'class-transformer';
import { SearchParams, SearchResponse } from 'elasticsearch';
import { MetricDto } from '../dto/metric.dto';
import { StatsApiQueriesService } from './stats-api-queries.service';

@Injectable()
export class StatsApiService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly statsApiQueriesService: StatsApiQueriesService,
  ) {}

  async getUserCount() {
    const query: SearchParams = this.statsApiQueriesService.getLastIdentitiesCount();
    const data: SearchResponse<unknown> = await this.elasticsearchService
      .getClient()
      .search(query);

    const stats = data.hits.hits.map(doc =>
      plainToClass(MetricDto, doc._source),
    );

    return stats[0];
  }
}
