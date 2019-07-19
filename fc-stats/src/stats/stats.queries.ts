import { Injectable } from '@nestjs/common';

@Injectable()
export class StatsQueries {
  getEvents(params) {
    const { start, stop } = params;
    const index = 'stats';
    const type = 'entry';

    const query = {
      index,
      size: 100,
      body: {
        sort: [
          { date: { order: 'asc' } },
          { fi: { order: 'asc' } },
          { fs: { order: 'asc' } },
          { typeAction: { order: 'asc' } },
          { action: { order: 'asc' } },
        ],
        query: {
          bool: {
            must: [
              { term: { _type: type } },
              {
                range: {
                  date: {
                    gte: start.getTime(),
                    lte: stop.getTime(),
                  },
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
