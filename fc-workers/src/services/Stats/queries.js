import moment from 'moment';

export const getIdsToDelete = params => {
  const { from, size } = params;
  const index = 'franceconnect';
  const type = 'log';

  const query = {
    index,
    from,
    size,
    body: {
      fields: ['_id'],
      query: {
        bool: {
          must: [
            { term: { _type: type } },
            {
              range: {
                time: {
                  lt: 'now-6M/d',
                },
              },
            },
          ],
        },
      },
    },
  };

  return query;
};

export const getByIntervalByFIFS = params => {
  const { start, stop, interval, after } = params;
  const index = 'franceconnect';

  const query = {
    index,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            {
              range: {
                time: {
                  gte: moment(start).format('YYYY-MM-DD'),
                  lte: moment(stop).format('YYYY-MM-DD'),
                },
              },
            },
          ],
        },
      },
      aggs: {
        date: {
          composite: {
            size: 10000,
            sources: [
              {
                date: {
                  date_histogram: {
                    field: 'time',
                    calendar_interval: interval,
                    format: 'yyyy-MM-dd',
                  },
                },
              },
              { typeAction: { terms: { field: 'type_action' } } },
              { action: { terms: { field: 'action' } } },
              { fs: { terms: { field: 'fs', missing_bucket: true } } },
              { fi: { terms: { field: 'fi', missing_bucket: true } } },
            ],
          },
        },
      },
    },
  };

  if (after) {
    query.body.aggs.date.composite.after = after;
  }

  return query;
};

export const getActiveAccount = params => {
  const { start, stop } = params;
  const index = 'franceconnect';

  const query = {
    index,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { action: 'authentication' } },
            { term: { type_action: 'initial' } },
            {
              range: {
                time: {
                  gte: moment(start).format('YYYY-MM-DD'),
                  lte: moment(stop).format('YYYY-MM-DD'),
                },
              },
            },
          ],
        },
      },
      aggs: {
        activeUsers: {
          cardinality: {
            field: 'accountId',
          },
        },
      },
    },
  };

  return query;
};
