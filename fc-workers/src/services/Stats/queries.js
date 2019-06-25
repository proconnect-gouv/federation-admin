/* eslint-disable import/prefer-default-export */
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
