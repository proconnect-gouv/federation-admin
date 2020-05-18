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

export const getTotalForActionsAndFiAndRangeByWeek = params => {
  const { fi, start, stop } = params;
  const index = 'events';

  const startTime = moment(start).format('YYYY-MM-DD');
  const stopTime = moment(stop).format('YYYY-MM-DD');

  const query = {
    index,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { fi } },
            {
              range: {
                date: {
                  gte: startTime,
                  lte: stopTime,
                },
              },
            },
            {
              bool: {
                should: [
                  {
                    match: { typeAction: 'initial' },
                  },
                  {
                    match: { typeAction: 'identityProviderChoice' },
                  },
                  {
                    match: { typeAction: 'identityProviderAuthentication' },
                  },
                ],
              },
            },
          ],
        },
      },
      aggs: {
        week: {
          date_histogram: {
            field: 'date',
            interval: 'week',
            min_doc_count: 0,
            extended_bounds: {
              min: startTime,
              max: stopTime,
            },
          },
          aggs: {
            action: {
              terms: {
                field: 'typeAction',
              },
              aggs: {
                count: {
                  sum: {
                    field: 'count',
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return query;
};
export const getByIntervalByFIFS = params => {
  const { start, stop, interval, size, after } = params;
  const index = 'franceconnect';

  const startTime = moment(start).format('YYYY-MM-DD');
  const stopTime = moment(stop).format('YYYY-MM-DD');

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
                  gte: startTime,
                  lte: stopTime,
                },
              },
            },
          ],
        },
      },
      aggs: {
        date: {
          composite: {
            size,
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

  const startTime = moment(start).format('YYYY-MM-DD');
  const stopTime = moment(stop).format('YYYY-MM-DD');

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
                  gte: startTime,
                  lte: stopTime,
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

export const getUsageCountsByRange = params => {
  const { start, stop, after, buckets } = params;

  const index = 'franceconnect';

  const startTime = moment(start).format('YYYY-MM-DD');
  const stopTime = moment(stop).format('YYYY-MM-DD');

  const query = {
    index,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { type_action: 'initial' } },
            {
              range: {
                time: {
                  gte: startTime,
                  lte: stopTime,
                },
              },
            },
          ],
        },
      },

      aggs: {
        accounts: {
          composite: {
            size: buckets,
            sources: {
              sub: {
                terms: {
                  field: 'accountId',
                },
              },
            },
          },
        },
      },
    },
  };

  if (after) {
    query.body.aggs.accounts.composite.after = after;
  }

  return query;
};

export const getUsageCountsByRange = params => {
  const { start, stop, after, buckets } = params;

  const index = 'franceconnect';

  const startTime = moment(start).format('YYYY-MM-DD');
  const stopTime = moment(stop).format('YYYY-MM-DD');

  const query = {
    index,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { type_action: 'initial' } },
            {
              range: {
                time: {
                  gte: startTime,
                  lte: stopTime,
                },
              },
            },
          ],
        },
      },

      aggs: {
        accounts: {
          composite: {
            size: buckets,
            sources: {
              sub: {
                terms: {
                  field: 'accountId',
                },
              },
            },
          },
        },
      },
    },
  };

  if (after) {
    query.body.aggs.accounts.composite.after = after;
  }

  return query;
};
