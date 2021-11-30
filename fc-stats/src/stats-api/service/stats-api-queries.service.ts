import { Injectable } from '@nestjs/common';
import { SearchParams } from 'elasticsearch';

@Injectable()
export class StatsApiQueriesService {
  /**
   * Simple template function for sort
   */
  private generateSort(field, order) {
    return { [field]: { order } };
  }

  getLastIdentitiesCount(): SearchParams {
    const query = {
      index: 'metrics',
      size: 1,
      from: 0,
      body: {
        sort: this.generateSort('date', 'desc'),
        query: {
          bool: {
            must: [
              {
                match: {
                  key: 'identity',
                },
              },
              {
                match: {
                  range: 'day',
                },
              },
            ],
          },
        },
      },
    };

    return query;
  }
}
