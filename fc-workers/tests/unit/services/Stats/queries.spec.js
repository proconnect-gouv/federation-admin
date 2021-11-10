import {
  getIdsToDelete,
  getTotalForActionsAndFiAndRangeByWeek,
  getByIntervalByFIFS,
  getActiveAccount,
  getUsageCountsByRange,
  getLastIdentitiesCount,
} from '../../../../src/services/Stats/queries';

describe('Queries', () => {
  describe('getIdsToDelete()', () => {
    it('should return query based on params', () => {
      const params = { from: 'fromValue', size: 'sizeValue' };

      const resultMock = {
        body: {
          fields: ['_id'],
          query: {
            bool: {
              must: [
                { term: { _type: 'log' } },
                { range: { time: { lt: 'now-6M/d' } } },
              ],
            },
          },
        },
        from: 'fromValue',
        size: 'sizeValue',
      };
      const result = getIdsToDelete(params);
      expect(result).toStrictEqual(resultMock);
    });
  });
  describe('getTotalForActionsAndFiAndRangeByWeek()', () => {
    it('should return query based on params', () => {
      const params = {
        start: '2021-09-16T13:37:42',
        stop: '2021-09-18T13:37:42',
        fi: 'fiValue',
      };

      const resultMock = {
        size: 0,
        body: {
          query: {
            bool: {
              must: [
                {
                  term: {
                    fi: 'fiValue',
                  },
                },
                { range: { date: { gte: '2021-09-16', lte: '2021-09-18' } } },
                {
                  bool: {
                    should: [
                      { match: { typeAction: 'initial' } },
                      { match: { typeAction: 'identityProviderChoice' } },
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
                extended_bounds: { min: '2021-09-16', max: '2021-09-18' },
              },
              aggs: {
                action: {
                  terms: { field: 'typeAction' },
                  aggs: { count: { sum: { field: 'count' } } },
                },
              },
            },
          },
        },
      };

      const result = getTotalForActionsAndFiAndRangeByWeek(params);

      expect(result).toStrictEqual(resultMock);
    });
  });
  describe('getByIntervalByFIFS()', () => {
    it('should return query based on params', () => {
      const params = {
        start: '2021-09-16T13:37:42',
        stop: '2021-09-18T13:37:42',
        interval: 1000,
        size: 42,
        after: true,
      };

      const resultMock = {
        size: 0,
        body: {
          query: {
            bool: {
              must: [
                { range: { time: { gte: '2021-09-16', lte: '2021-09-18' } } },
              ],
            },
          },
          aggs: {
            date: {
              composite: {
                size: 42,
                sources: [
                  {
                    date: {
                      date_histogram: {
                        field: 'time',
                        calendar_interval: 1000,
                        format: 'yyyy-MM-dd',
                      },
                    },
                  },
                  { typeAction: { terms: { field: 'type_action' } } },
                  { action: { terms: { field: 'action' } } },
                  { fs: { terms: { field: 'fs', missing_bucket: true } } },
                  {
                    fs_label: {
                      terms: { field: 'fs_label.raw', missing_bucket: true },
                    },
                  },
                  { fi: { terms: { field: 'fi', missing_bucket: true } } },
                  {
                    fsId: {
                      terms: {
                        field: 'fsId',
                        missing_bucket: true,
                      },
                    },
                  },
                  {
                    clientId: {
                      terms: {
                        field: 'clientId',
                        missing_bucket: true,
                      },
                    },
                  },
                  {
                    fiId: {
                      terms: {
                        field: 'fiId',
                        missing_bucket: true,
                      },
                    },
                  },
                ],
                after: true,
              },
            },
          },
        },
      };

      const result = getByIntervalByFIFS(params);

      expect(result).toStrictEqual(resultMock);
    });

    it('should return query based on params without after', () => {
      const params = {
        start: '2021-09-16T13:37:42',
        stop: '2021-09-18T13:37:42',
        interval: 1000,
        size: 42,
        after: false,
      };

      const resultMock = {
        size: 0,
        body: {
          query: {
            bool: {
              must: [
                { range: { time: { gte: '2021-09-16', lte: '2021-09-18' } } },
              ],
            },
          },
          aggs: {
            date: {
              composite: {
                size: 42,
                sources: [
                  {
                    date: {
                      date_histogram: {
                        field: 'time',
                        calendar_interval: 1000,
                        format: 'yyyy-MM-dd',
                      },
                    },
                  },
                  { typeAction: { terms: { field: 'type_action' } } },
                  { action: { terms: { field: 'action' } } },
                  { fs: { terms: { field: 'fs', missing_bucket: true } } },
                  {
                    fs_label: {
                      terms: { field: 'fs_label.raw', missing_bucket: true },
                    },
                  },
                  { fi: { terms: { field: 'fi', missing_bucket: true } } },
                  {
                    fsId: {
                      terms: {
                        field: 'fsId',
                        missing_bucket: true,
                      },
                    },
                  },
                  {
                    clientId: {
                      terms: {
                        field: 'clientId',
                        missing_bucket: true,
                      },
                    },
                  },
                  {
                    fiId: {
                      terms: {
                        field: 'fiId',
                        missing_bucket: true,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      };

      const result = getByIntervalByFIFS(params);

      expect(result).toStrictEqual(resultMock);
    });
  });
  describe('getActiveAccount()', () => {
    it('should return query based on params', () => {
      const params = {
        start: '2021-09-16T13:37:42',
        stop: '2021-09-18T13:37:42',
      };

      const resultMock = {
        size: 0,
        body: {
          query: {
            bool: {
              must: [
                { term: { action: 'authentication' } },
                { term: { type_action: 'initial' } },
                { range: { time: { gte: '2021-09-16', lte: '2021-09-18' } } },
              ],
            },
          },
          aggs: { activeUsers: { cardinality: { field: 'accountId' } } },
        },
      };

      const result = getActiveAccount(params);

      expect(result).toStrictEqual(resultMock);
    });
  });
  describe('getUsageCountsByRange()', () => {
    it('should return query based on params', () => {
      const params = {
        start: '2021-09-16T13:37:42',
        stop: '2021-09-18T13:37:42',
        after: true,
        buckets: 42,
      };

      const resultMock = {
        body: {
          aggs: {
            accounts: {
              composite: {
                after: true,
                size: 42,
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
          query: {
            bool: {
              must: [
                {
                  term: {
                    type_action: 'initial',
                  },
                },
                {
                  range: {
                    time: {
                      gte: '2021-09-16',
                      lte: '2021-09-18',
                    },
                  },
                },
              ],
            },
          },
        },
        size: 0,
      };

      const result = getUsageCountsByRange(params);

      expect(result).toStrictEqual(resultMock);
    });

    it('should return query based on params with after', () => {
      const params = {
        start: '2021-09-16T13:37:42',
        stop: '2021-09-18T13:37:42',
        after: false,
        buckets: 42,
      };

      const resultMock = {
        body: {
          aggs: {
            accounts: {
              composite: {
                size: 42,
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
          query: {
            bool: {
              must: [
                {
                  term: {
                    type_action: 'initial',
                  },
                },
                {
                  range: {
                    time: {
                      gte: '2021-09-16',
                      lte: '2021-09-18',
                    },
                  },
                },
              ],
            },
          },
        },
        size: 0,
      };

      const result = getUsageCountsByRange(params);

      expect(result).toStrictEqual(resultMock);
    });
  });

  describe('getLastIdentitiesCount()', () => {
    // Given
    const params = {
      date: '2019-02-12',
    };
    const resultMock = {
      body: {
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
                  range: 'month',
                },
              },
              {
                range: {
                  date: {
                    lte: '2019-02-12',
                  },
                },
              },
            ],
          },
        },
      },
      size: 1,
      from: 0,
      sort: ['date:desc'],
    };
    // When
    const result = getLastIdentitiesCount(params);

    // Then
    expect(result).toStrictEqual(resultMock);
  });
});
