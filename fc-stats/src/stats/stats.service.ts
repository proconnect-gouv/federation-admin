import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { plainToClass } from 'class-transformer';
import { StatsDTO } from './dto/stats.dto';
import { StatsQueries } from './stats.queries';

@Injectable()
export class StatsService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly statsQueries: StatsQueries,
  ) {
    this.elasticsearchService = elasticsearchService;
    this.statsQueries = statsQueries;
  }

  async getEvents(params): Promise<Array<StatsDTO>> {
    const query = this.statsQueries.getEvents(params);
    const data = await this.elasticsearchService.getClient().search(query);
    const esResponse = this.getItems(data);

    return esResponse;
  }

  private getItems(response): Array<StatsDTO> {
    return response.hits.hits.map(item =>
      plainToClass(StatsDTO, { id: item._id, ...item._source }),
    );
  }
}
