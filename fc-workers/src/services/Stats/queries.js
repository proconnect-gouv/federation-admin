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
  const { start, stop, interval } = params;
  const index = 'franceconnect';
  const type = 'log';

  const query = {
    index,
    body: {
      query: {
        bool: {
          must: [
            { term: { _type: type } },
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
          date_histogram: {
            field: 'time',
            interval,
            min_doc_count: 0,
            extended_bounds: {
              min: moment(start).format('YYYY-MM-DD'),
              max: moment(stop).format('YYYY-MM-DD'),
            },
          },
          aggs: {
            action: {
              terms: {
                field: 'action',
                size: 0,
              },
              aggs: {
                typeAction: {
                  terms: {
                    field: 'type_action',
                    size: 0,
                  },
                  aggs: {
                    // Elasticseach 1.6 does not support 'missing' fields
                    nofs: {
                      missing: {
                        field: 'fs.raw',
                      },
                      aggs: {
                        fi: {
                          terms: {
                            field: 'fi.raw',
                            size: 0,
                          },
                        },
                      },
                    },
                    fs: {
                      terms: {
                        field: 'fs.raw',
                        size: 0,
                      },
                      aggs: {
                        fi: {
                          terms: {
                            field: 'fi.raw',
                            size: 0,
                          },
                        },
                      },
                    },
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

export const getActiveAccount = params => {
  const { start, stop } = params;
  const index = 'franceconnect';
  const type = 'log';

  const query = {
    index,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { _type: type } },
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
