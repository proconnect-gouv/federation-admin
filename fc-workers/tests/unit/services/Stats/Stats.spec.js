import Container from '../../../../src/services/Container';
import {
  EVENTS_INDEX,
  FRANCECONNECT_INDEX,
  METRICS_INDEX,
} from '../../../../src/services/Stats/base';
import Stats from '../../../../src/services/Stats/Stats';

import * as queries from '../../../../src/services/Stats/queries';

jest.mock('../../../../src/services/Stats/queries');

describe('Stats', () => {
  let statsService;
  let addIndexMock;

  const configMock = {
    get: jest.fn(),
    getElasticMainIndex: jest.fn(),
    getElasticMetricsIndex: jest.fn(),
    getElasticEventsIndex: jest.fn(),
  };

  const dataApiMock = {
    bulk: jest.fn(),
    search: jest.fn(),
  };
  const logApiMock = {
    search: jest.fn(),
  };
  const inputMock = {
    get: jest.fn(),
  };

  const container = new Container();
  container.add('config', () => configMock);
  container.add('dataApi', () => dataApiMock);
  container.add('logApi', () => logApiMock);
  container.add('input', () => inputMock);

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    statsService = new Stats(container);
  });

  describe('addIndex()', () => {
    const queryMock = {
      test: Symbol('query'),
    };

    beforeEach(() => {
      configMock.getElasticEventsIndex.mockReturnValueOnce('events');
      configMock.getElasticMetricsIndex.mockReturnValueOnce('metrics');
      configMock.getElasticMainIndex.mockReturnValueOnce('franceconnect');
    });

    it('should add index of franceconnect by default', () => {
      // Given
      const resultMock = {
        ...queryMock,
        index: 'franceconnect',
      };
      // When
      const result = statsService.addIndex(queryMock);
      // Then
      expect(result).toStrictEqual(resultMock);
    });

    it('should add index of franceconnect', () => {
      // Given
      const resultMock = {
        ...queryMock,
        index: 'franceconnect',
      };
      // When
      const result = statsService.addIndex(queryMock, FRANCECONNECT_INDEX);
      // Then
      expect(result).toStrictEqual(resultMock);
    });

    it('should add index of events', () => {
      // Given
      const resultMock = {
        ...queryMock,
        index: 'events',
      };
      // When
      const result = statsService.addIndex(queryMock, EVENTS_INDEX);
      // Then
      expect(result).toStrictEqual(resultMock);
    });
    it('should add index of metrics', () => {
      // Given
      const resultMock = {
        ...queryMock,
        index: 'metrics',
      };
      // When
      const result = statsService.addIndex(queryMock, METRICS_INDEX);
      // Then
      expect(result).toStrictEqual(resultMock);
    });
  });

  describe('getLastAccountNumber()', () => {
    const rawQueryMock = {
      test: 'testValue',
    };
    const queryMock = {
      ...rawQueryMock,
      index: 'metrics',
    };

    beforeEach(() => {
      queries.getLastIdentitiesCount.mockReturnValueOnce();
      addIndexMock = jest.spyOn(statsService, 'addIndex');
      addIndexMock.mockReturnValueOnce(queryMock);
    });

    it('should return the last number of accounts in database', async () => {
      // Given
      const paramsMock = {
        date: '2019-02-12',
      };
      const resultMock = {
        lastDate: '2019-01-31',
        identities: 42,
      };

      const searchMock = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  date: '2019-01-31',
                  value: 42,
                },
              },
            ],
          },
        },
      };

      logApiMock.search.mockResolvedValueOnce(searchMock);

      // When
      const result = await statsService.getLastAccountNumber(paramsMock);

      // Then
      expect(result).toStrictEqual(resultMock);
      expect(logApiMock.search).toHaveBeenCalledTimes(1);
      expect(queries.getLastIdentitiesCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('getIdsToDelete()', () => {
    const rawQueryMock = {
      test: 'testValue',
    };
    const queryMock = {
      ...rawQueryMock,
      index: 'franceconnect',
    };

    beforeEach(() => {
      queries.getIdsToDelete.mockReturnValueOnce();
      addIndexMock = jest.spyOn(statsService, 'addIndex');
      addIndexMock.mockReturnValueOnce(queryMock);
    });
    it('should get the ids to delete', async () => {
      // Given
      const from = '2021-06-16';
      const size = 42;
      const paramsMock = {
        from,
        size,
      };
      const totalMock = 42;

      const resultMock = {
        from,
        size,
        total: totalMock,
        ids: [1, 3, 5],
      };
      const searchMock = {
        hits: {
          hits: [
            {
              _id: 1,
            },
            {
              _id: 3,
            },
            {
              _id: 5,
            },
          ],
          total: totalMock,
        },
      };

      dataApiMock.search.mockResolvedValueOnce(searchMock);

      // When
      const result = await statsService.getIdsToDelete(paramsMock);

      // Then
      expect(result).toStrictEqual(resultMock);
      expect(dataApiMock.search).toHaveBeenCalledTimes(1);
      expect(queries.getIdsToDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('getByIntervalByFIFS()', () => {
    const rawQuery = {
      test: 'world',
    };
    const queryMock = {
      ...rawQuery,
      index: 'franceconnect',
    };

    const logApiResult = Symbol('logApiResult');

    beforeEach(() => {
      addIndexMock = jest.spyOn(statsService, 'addIndex');
      addIndexMock.mockReturnValueOnce(queryMock);
      queries.getByIntervalByFIFS.mockReturnValueOnce(rawQuery);
      logApiMock.search.mockResolvedValueOnce(logApiResult);
    });

    it('should get interval by FI FS', async () => {
      const start = 'startValue';
      const stop = 'stopValue';
      const interval = 1000;
      const size = 42;
      const after = true;

      const result = await statsService.getByIntervalByFIFS(
        start,
        stop,
        interval,
        size,
        after
      );
      expect(logApiMock.search).toHaveBeenCalledTimes(1);
      expect(logApiMock.search).toHaveBeenCalledWith(queryMock);
      expect(result).toStrictEqual(logApiResult);
    });
  });

  describe('getTotalForActionsAndFiAndRangeByWeek()', () => {
    const rawQuery = {
      test: 'world',
    };
    const queryMock = {
      ...rawQuery,
      index: 'event',
    };

    const logApiResult = {
      body: {
        aggregations: {
          week: {
            buckets: [
              {
                key: 1,
                action: {
                  buckets: [
                    {
                      key: 11,
                      count: {
                        value: 42,
                      },
                    },
                    {
                      key: 12,
                      count: {
                        value: 43,
                      },
                    },
                  ],
                },
              },
              {
                key: 2,
                action: {
                  buckets: [
                    {
                      key: 21,
                      count: {
                        value: 44,
                      },
                    },
                    {
                      key: 22,
                      count: {
                        value: 45,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    };

    beforeEach(() => {
      queries.getTotalForActionsAndFiAndRangeByWeek.mockReturnValueOnce(
        rawQuery
      );
      addIndexMock = jest.spyOn(statsService, 'addIndex');
      addIndexMock.mockReturnValueOnce(queryMock);
      logApiMock.search.mockResolvedValueOnce(logApiResult);
    });
    it('should aggregate data based on dates and idp', async () => {
      const fi = 'fiValue';
      const start = 'startValue';
      const stop = 'stopValue';
      const resultMock = [
        {
          events: [
            { count: 42, label: 11 },
            { count: 43, label: 12 },
          ],
          startDate: 1,
        },
        {
          events: [
            { count: 44, label: 21 },
            { count: 45, label: 22 },
          ],
          startDate: 2,
        },
      ];

      const result = await statsService.getTotalForActionsAndFiAndRangeByWeek(
        fi,
        start,
        stop
      );

      expect(addIndexMock).toHaveBeenCalledTimes(1);
      expect(addIndexMock).toHaveBeenCalledWith(rawQuery, EVENTS_INDEX);
      expect(logApiMock.search).toHaveBeenCalledTimes(1);
      expect(logApiMock.search).toHaveBeenCalledWith(queryMock);
      expect(result).toStrictEqual(resultMock);
    });
  });

  describe('getActiveAccountsByRange()', () => {
    let getStopDateForRangeMock;

    const stopMock = new Date('2021/09/16');

    const rawQuery = {
      test: 'hello',
    };
    const queryMock = {
      ...rawQuery,
      index: 'franceconnect',
    };

    const valueMock = Symbol('logApiResult');

    const logApiResult = {
      body: {
        aggregations: {
          activeUsers: {
            value: valueMock,
          },
        },
      },
    };

    beforeEach(() => {
      queries.getActiveAccount.mockReturnValueOnce(rawQuery);

      logApiMock.search.mockResolvedValueOnce(logApiResult);

      getStopDateForRangeMock = jest.spyOn(statsService, 'getStopDateForRange');
      getStopDateForRangeMock.mockReturnValueOnce(stopMock);

      addIndexMock = jest.spyOn(statsService, 'addIndex');
      addIndexMock.mockReturnValueOnce(queryMock);
    });

    it('should get active account', async () => {
      const params = {
        hello: 'world',
      };
      const result = await statsService.getActiveAccountsByRange(params);

      expect(getStopDateForRangeMock).toHaveBeenCalledTimes(1);
      expect(queries.getActiveAccount).toHaveBeenCalledTimes(1);
      expect(queries.getActiveAccount).toHaveBeenCalledWith({
        ...params,
        stop: stopMock,
      });
      expect(addIndexMock).toHaveBeenCalledTimes(1);
      expect(addIndexMock).toHaveBeenCalledWith(rawQuery);

      expect(logApiMock.search).toHaveBeenCalledTimes(1);
      expect(logApiMock.search).toHaveBeenCalledWith(queryMock);
      expect(result).toStrictEqual(valueMock);
    });
  });

  describe('getUsageCountsByRange', () => {
    let getStopDateForRangeMock;

    const stopMock = new Date('2021/09/16');

    const rawQuery = {
      test: 'hello',
    };
    const queryMock = {
      ...rawQuery,
      index: 'franceconnect',
    };

    const logApiResult = Symbol('logApiResult');

    beforeEach(() => {
      queries.getUsageCountsByRange.mockReturnValueOnce(rawQuery);

      logApiMock.search.mockResolvedValueOnce(logApiResult);

      getStopDateForRangeMock = jest.spyOn(statsService, 'getStopDateForRange');
      getStopDateForRangeMock.mockReturnValueOnce(stopMock);

      addIndexMock = jest.spyOn(statsService, 'addIndex');
      addIndexMock.mockReturnValueOnce(queryMock);
    });

    it('should get Usage count by range', async () => {
      const params = {
        hello: 'world',
      };
      const result = await statsService.getUsageCountsByRange(params);

      expect(getStopDateForRangeMock).toHaveBeenCalledTimes(1);
      expect(queries.getUsageCountsByRange).toHaveBeenCalledTimes(1);
      expect(queries.getUsageCountsByRange).toHaveBeenCalledWith({
        ...params,
        stop: stopMock,
      });
      expect(addIndexMock).toHaveBeenCalledTimes(1);
      expect(addIndexMock).toHaveBeenCalledWith(rawQuery);

      expect(logApiMock.search).toHaveBeenCalledTimes(1);
      expect(logApiMock.search).toHaveBeenCalledWith(queryMock, {
        asStream: true,
      });
      expect(result).toStrictEqual(logApiResult);
    });
  });

  describe('createMetricDocument', () => {
    it('Should return a metric document', () => {
      // Given
      const key = 'foo';
      const value = 'bar';
      const date = '2018-09-01';
      const dateMock = new Date(date).toISOString();
      container.add('input', () => ({}));

      inputMock.get.mockImplementationOnce((_schema, entry) => entry);

      // When
      const result = statsService.createMetricDocument({ key, value, date });

      // Then
      expect(result).toEqual({
        key,
        value,
        date: dateMock,
      });
    });
    it('Should fail on missing arguments', () => {
      // Given
      const key = 'foo';
      const date = '2018-09-01';
      // When
      const execute = () => statsService.createMetricDocument({ key, date });
      // Then
      expect(execute).toThrowError();
    });
    it('Should fail on invalid arguments', () => {
      // Given
      const key = 'foo';
      const value = 'bar';
      const date = 'yo';
      // When
      const execute = () =>
        statsService.createMetricDocument({ key, value, date });
      // Then
      expect(execute).toThrowError();
    });
  });

  describe('createBulkQuery', () => {
    it('Should return an array with headers items', () => {
      // Given
      const documents = [
        { key: 'foo', value: 'bar', date: 'baz' },
        { key: 'fizz', value: 'buzz', date: 'wozz' },
      ];
      const operation = 'index';
      const index = 'pof';
      const idFunction = item => item.key;
      // When
      const result = statsService.createBulkQuery(
        documents,
        operation,
        index,
        idFunction
      );
      // Then
      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        index: { _index: 'pof', _id: 'foo' },
      });
      expect(result[1]).toEqual(documents[0]);
      expect(result[2]).toEqual({
        index: { _index: 'pof', _id: 'fizz' },
      });
      expect(result[3]).toEqual(documents[1]);
    });

    it('Should return an array', () => {
      // Given
      const operation = 'index';
      const index = 'pof';
      const idFunction = item => item.key;
      const list = [{ a: 'a' }, { b: 'b' }];
      // When
      const result = statsService.createBulkQuery(
        list,
        operation,
        index,
        idFunction
      );
      // then
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should return an twice as much items than input', () => {
      // Given
      const operation = 'a';
      const index = 'pof';
      const idFunction = item => item.key;
      const list = [{ a: 'a' }, { b: 'b' }];
      // When
      const result = statsService.createBulkQuery(
        list,
        operation,
        index,
        idFunction
      );
      // then
      expect(result).toHaveLength(4);
    });

    it('Should return an array containing header and input objects', () => {
      // Given
      const operation = 'a';
      const index = 'pof';
      const idFunction = item => item.id;
      const list = [
        { id: 'a', b: 'b' },
        { id: 'b', c: 'c' },
      ];
      // When
      const result = statsService.createBulkQuery(
        list,
        operation,
        index,
        idFunction
      );
      // then
      expect(result[0]).toEqual({
        a: { _index: 'pof', _id: 'a' },
      });
      expect(result[1]).toEqual({ b: 'b', id: 'a' });
      expect(result[2]).toEqual({
        a: { _index: 'pof', _id: 'b' },
      });
      expect(result[3]).toEqual({ id: 'b', c: 'c' });
    });
  });

  describe('stringifyQuery', () => {
    it('Should return a new line separated list of objects', () => {
      // Given
      const input = [{ a: 'a' }, { b: 'b' }];
      // When
      const result = Stats.stringifyQuery(input);
      // Then
      expect(result).toBe('{"a":"a"}\n{"b":"b"}\n');
    });
  });

  describe('executeBulkQuery', () => {
    it('Should call api service bulk method', () => {
      // Given
      const query = ['foo'];

      // When
      statsService.executeBulkQuery(query);
      // Then
      expect(dataApiMock.bulk).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStopDateForRange', () => {
    it('Should return the date the same day', () => {
      // Given
      const params = {
        start: new Date('2018-01-01'),
        range: 'day',
      };
      // When
      const result = statsService.getStopDateForRange(params);
      // Then
      expect(result).toEqual(params.start);
    });
    it('Should return the end date for 1 week', () => {
      // Given
      const params = {
        start: new Date('2018-01-01'),
        range: 'week',
      };
      // When
      const result = statsService.getStopDateForRange(params);
      // Then
      expect(result).toEqual(new Date('2018-01-07'));
    });
    it('Should return the end date for 1 month', () => {
      // Given
      const params = {
        start: new Date('2018-01-01'),
        range: 'month',
      };
      // When
      const result = statsService.getStopDateForRange(params);
      // Then
      expect(result).toEqual(new Date('2018-01-31'));
    });
    it('Should return the end date for 1 month regardless length of the month', () => {
      // Given
      const params = {
        start: new Date('2018-02-01'),
        range: 'month',
      };
      // When
      const result = statsService.getStopDateForRange(params);
      // Then
      expect(result).toEqual(new Date('2018-02-28'));
    });
    it('Should return the end date for 1 year', () => {
      // Given
      const params = {
        start: new Date('2018-01-01'),
        range: 'year',
      };
      // When
      const result = statsService.getStopDateForRange(params);
      // Then
      expect(result).toEqual(new Date('2018-12-31'));
    });
  });

  describe('index()', () => {
    let executeBulkQueryMock;
    let createBulkQueryMock;

    const doc = Symbol('doc');
    const index = Symbol('index');
    const id = Symbol('id');

    const executeResult = Symbol('executeBulkQuery');
    const createBulkResult = Symbol('createBulkQuery');

    beforeEach(() => {
      executeBulkQueryMock = jest.spyOn(statsService, 'executeBulkQuery');
      executeBulkQueryMock.mockResolvedValueOnce(executeResult);

      createBulkQueryMock = jest.spyOn(statsService, 'createBulkQuery');
      createBulkQueryMock.mockReturnValueOnce(createBulkResult);
    });
    it('should register doc in index', async () => {
      // Given
      // When
      const result = await statsService.index(doc, index, id);
      // then
      expect(result).toBe(executeResult);
      expect(createBulkQueryMock).toHaveBeenCalledTimes(1);
      expect(createBulkQueryMock).toHaveBeenCalledWith(
        [doc],
        'index',
        index,
        expect.any(Function)
      );

      const [firstCall] = createBulkQueryMock.mock.calls;
      const [, , , lastArgs] = firstCall;
      expect(lastArgs()).toBe(id);

      expect(executeBulkQueryMock).toHaveBeenCalledTimes(1);
      expect(executeBulkQueryMock).toHaveBeenCalledWith(createBulkResult);
    });
  });
});
