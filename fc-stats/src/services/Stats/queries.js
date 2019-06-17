export const getTotalByActionAndRange = params => {
  const { action, start, stop } = params;
  const index = 'stats';
  const type = 'entry';

  const query = {
    index,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { action } },
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
      aggs: {
        [action]: {
          sum: {
            field: 'count',
          },
        },
      },
    },
  };

  return query;
};

export const getTotalForActionsAndFiAndRangeByWeek = params => {
  const { fi, start, stop } = params;
  const index = 'stats';
  const type = 'entry';

  const query = {
    index,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { fi } },
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
      aggs: {
        week: {
          date_histogram: {
            field: 'date',
            interval: 'week',
            min_doc_count: 0,
            extended_bounds: {
              min: start.getTime(),
              max: stop.getTime(),
            },
          },
          aggs: {
            action: {
              terms: {
                field: 'typeAction',
                size: 0,
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
