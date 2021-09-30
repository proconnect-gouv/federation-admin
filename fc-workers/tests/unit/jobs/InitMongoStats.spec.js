import IndexMongoStats from '../../../src/jobs/IndexMongoStats';
import InitMongoStats from '../../../src/jobs/InitMongoStats';
import Container from '../../../src/services/Container';

const daysMock = [
  { date: '2020-12-15', value: 2 },
  { date: '2020-12-16', value: 3 },
  { date: '2020-12-17', value: 4 },
  { date: '2020-12-18', value: 2 },
  { date: '2020-12-19', value: 3 },
  { date: '2020-12-20', value: 4 },
  { date: '2020-12-21', value: 2 }, // W
  { date: '2020-12-22', value: 3 },
  { date: '2020-12-23', value: 4 },
  { date: '2020-12-24', value: 2 },
  { date: '2020-12-25', value: 3 },
  { date: '2020-12-26', value: 4 },
  { date: '2020-12-27', value: 2 },
  { date: '2020-12-28', value: 3 }, // W
  { date: '2020-12-29', value: 4 },
  { date: '2020-12-30', value: 2 },
  { date: '2020-12-31', value: 3 },
  { date: '2021-01-01', value: 4 }, // M  Y
  { date: '2021-01-02', value: 2 },
  { date: '2021-01-03', value: 3 },
  { date: '2021-01-04', value: 4 }, // W
  { date: '2021-01-05', value: 2 },
  { date: '2021-01-06', value: 3 },
  { date: '2021-01-07', value: 4 },
  { date: '2021-01-08', value: 2 },
  { date: '2021-01-09', value: 3 },
  { date: '2021-01-10', value: 4 },
];

describe('InitMongoStats', () => {
  let initMongoStats;

  const statsMock = {
    createBulkQuery: jest.fn(),
    executeBulkQuery: jest.fn(),
  };

  const loggerMock = {
    info: jest.fn(),
  };

  const configMock = {
    getElasticMetricsIndex: jest.fn(),
  };

  const inputMock = {
    get: jest.fn(),
  };

  const accountMock = {
    aggregate: jest.fn(),
  };

  const connectionMock = { close: jest.fn() };

  const fcDatabaseMock = {
    models: {
      account: accountMock,
    },
    connections: [connectionMock],
  };

  const container = new Container();
  container.add('logger', () => loggerMock);
  container.add('config', () => configMock);
  container.add('input', () => inputMock);
  container.add('stats', () => statsMock);
  container.add('fcDatabase', () => Promise.resolve(fcDatabaseMock));

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    initMongoStats = new InitMongoStats(container);
  });

  describe('usage()', () => {
    it('should return usage instruction', () => {
      // Given
      // When
      const usage = InitMongoStats.usage();
      // Then
      expect(usage).toBe(
        '\n      Usage:\n      > InitMongoStats --metric=<registration>\n    '
      );
    });
  });

  describe('getMetric()', () => {
    let getInitRegistrationMock;

    const getInitRegistrationResult = Symbol('getInitRegistrationResult');
    beforeEach(() => {
      getInitRegistrationMock = jest.spyOn(
        InitMongoStats,
        'getInitRegistrationMetric'
      );
      getInitRegistrationMock.mockResolvedValueOnce(getInitRegistrationResult);
    });
    it('should get Registration metric', async () => {
      // Given
      const metric = 'registration';
      // When
      const result = await initMongoStats.getMetric(metric);
      // Then
      expect(result).toStrictEqual(getInitRegistrationResult);
      expect(getInitRegistrationMock).toHaveBeenCalledTimes(1);
      expect(getInitRegistrationMock).toHaveBeenCalledWith(accountMock);
    });
    it("should failed if metric doesn't exist", async () => {
      // Given
      const metric = 'Harpagon';
      await expect(
        // When
        initMongoStats.getMetric(metric)
        // Then
      ).rejects.toThrow(`Unknown metric: <${metric}>`);
    });
  });

  describe('getInitRegistrationMetric()', () => {
    it('should get registration metric aggregation', async () => {
      // Given
      const aggregationMock = Symbol('aggregationValue');
      accountMock.aggregate.mockResolvedValueOnce(aggregationMock);
      const accountParams = [
        {
          $group: {
            _id: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
            count: { $sum: 1 },
          },
        },
      ];
      // When
      const result = await InitMongoStats.getInitRegistrationMetric(
        accountMock
      );
      // Then
      expect(result).toStrictEqual(aggregationMock);
      expect(accountMock.aggregate).toHaveBeenCalledTimes(1);
      expect(accountMock.aggregate).toHaveBeenCalledWith(accountParams);
    });
  });

  describe('periodReducer()', () => {
    it('should return a function that...', () => {
      // Given
      const period = 'isoWeek';
      // When
      const result = InitMongoStats.periodReducer(period);
      // Then
      expect(typeof result).toBe('function');
    });
    it('should return an object when used as reducer', () => {
      // Given
      const period = 'isoWeek';
      // When
      const result = daysMock.reduce(InitMongoStats.periodReducer(period), {});
      // Then
      expect(typeof result).toBe('object');
    });
    it('should contain keys for each first day of weeks', () => {
      // Given
      const period = 'isoWeek';
      // When
      const result = daysMock.reduce(InitMongoStats.periodReducer(period), {});
      // Then
      expect(Object.keys(result)).toEqual([
        '2020-12-14',
        '2020-12-21',
        '2020-12-28',
        '2021-01-04',
      ]);
    });
  });

  describe('daysToPeriod()', () => {
    it('should call periodReducer', () => {
      // Given
      const periodReducerSpy = jest.spyOn(InitMongoStats, 'periodReducer');
      const period = 'week';
      // When
      InitMongoStats.daysToPeriod(daysMock, period);
      // Then
      expect(periodReducerSpy).toHaveBeenCalledTimes(1);
      expect(periodReducerSpy).toHaveBeenCalledWith(period);
    });
  });

  describe('daysToWeeks()', () => {
    it('should call InitMongoStats.daysToPeriod ', () => {
      // Given
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      // When
      InitMongoStats.daysToWeeks(daysMock);
      // Then
      expect(InitMongoStatsSpy).toHaveBeenCalledTimes(1);
      expect(InitMongoStatsSpy).toHaveBeenCalledWith(daysMock, 'isoWeek');
    });

    it('should return result from InitMongoStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      InitMongoStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = InitMongoStats.daysToWeeks(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return week aggregation', () => {
      // When
      const result = InitMongoStats.daysToWeeks(daysMock);
      // Then
      expect(result).toEqual([
        { date: '2020-12-14', value: 18 },
        { date: '2020-12-21', value: 20 },
        { date: '2020-12-28', value: 21 },
        { date: '2021-01-04', value: 22 },
      ]);
    });
  });

  describe('daysToMonths()', () => {
    it('should call InitMongoStats.daysToPeriod ', () => {
      // Given
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      // When
      InitMongoStats.daysToMonths(daysMock);
      // Then
      expect(InitMongoStatsSpy).toHaveBeenCalledTimes(1);
      expect(InitMongoStatsSpy).toHaveBeenCalledWith(daysMock, 'month');
    });

    it('should return result from InitMongoStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      InitMongoStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = InitMongoStats.daysToMonths(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return month aggregation', () => {
      // When
      const result = InitMongoStats.daysToMonths(daysMock);
      // Then
      expect(result).toEqual([
        { date: '2020-12-01', value: 50 },
        { date: '2021-01-01', value: 31 },
      ]);
    });
  });

  describe('daysToYears()', () => {
    it('should call InitMongoStats.daysToPeriod ', () => {
      // Given
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      // When
      InitMongoStats.daysToYears(daysMock);
      // Then
      expect(InitMongoStatsSpy).toHaveBeenCalledTimes(1);
      expect(InitMongoStatsSpy).toHaveBeenCalledWith(daysMock, 'year');
    });

    it('should return result from InitMongoStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      InitMongoStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = InitMongoStats.daysToYears(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return year aggregation', () => {
      // When
      const result = InitMongoStats.daysToYears(daysMock);
      // Then
      expect(result).toEqual([
        { date: '2020-01-01', value: 50 },
        { date: '2021-01-01', value: 31 },
      ]);
    });
  });

  describe('resultToDoc()', () => {
    it('should transform input to elastic doc', () => {
      // Given
      const input = [
        { date: '2021-01-21', value: 42 },
        { date: '2021-01-22', value: 1337 },
      ];
      const key = 'registration';
      const range = 'day';
      // When
      const result = InitMongoStats.resultToDoc(input, key, range);
      // Then
      expect(result).toEqual([
        {
          key: 'registration',
          date: '2021-01-21',
          value: 42,
          range: 'day',
        },
        {
          key: 'registration',
          date: '2021-01-22',
          value: 1337,
          range: 'day',
        },
      ]);
    });
  });

  describe('run()', () => {
    let getMetricMock;
    const getMetricResult = [
      { _id: 1, count: 42 },
      { _id: 2, count: 43 },
      { _id: 3, count: 44 },
    ];

    let daysToWeeksMock;
    let daysToMonthsMock;
    let daysToYearsMock;
    let createDocumentsMock;
    let resultToDocMock;

    const daysToWeeksResult = Symbol('daysToWeeks');
    const daysToMonthsResult = Symbol('daysToMonths');
    const daysToYearsResult = Symbol('daysToYears');

    const schemaMock = { metric: { mandatory: true, type: 'string' } };

    beforeEach(() => {
      getMetricMock = jest.spyOn(initMongoStats, 'getMetric');
      getMetricMock.mockReturnValueOnce(getMetricResult);

      daysToWeeksMock = jest.spyOn(InitMongoStats, 'daysToWeeks');
      daysToWeeksMock.mockReturnValueOnce(daysToWeeksResult);

      daysToMonthsMock = jest.spyOn(InitMongoStats, 'daysToMonths');
      daysToMonthsMock.mockReturnValueOnce(daysToMonthsResult);

      daysToYearsMock = jest.spyOn(InitMongoStats, 'daysToYears');
      daysToYearsMock.mockReturnValueOnce(daysToYearsResult);

      createDocumentsMock = jest.spyOn(initMongoStats, 'createDocuments');
      createDocumentsMock.mockReturnValueOnce();

      resultToDocMock = jest.spyOn(InitMongoStats, 'resultToDoc');
    });

    it('should run the program', async () => {
      // Given
      inputMock.get.mockReturnValueOnce({
        metric: accountMock,
      });
      const resultToDocResults = [[1], [2], [3], [4]];
      const daysParams = [
        { date: 1, value: 42 },
        { date: 2, value: 43 },
        { date: 3, value: 44 },
      ];
      resultToDocMock
        .mockReturnValueOnce(resultToDocResults[0])
        .mockReturnValueOnce(resultToDocResults[1])
        .mockReturnValueOnce(resultToDocResults[2])
        .mockReturnValueOnce(resultToDocResults[3]);

      const paramsMock = Symbol('params');

      const createDocumentsParam = [1, 2, 3, 4];

      // When
      await initMongoStats.run(paramsMock);

      // Then
      expect(loggerMock.info).toHaveBeenCalledTimes(7);
      expect(inputMock.get).toHaveBeenCalledTimes(1);
      expect(inputMock.get).toHaveBeenCalledWith(schemaMock, paramsMock);
      expect(getMetricMock).toHaveBeenCalledTimes(1);
      expect(getMetricMock).toHaveBeenCalledWith(accountMock);

      expect(daysToWeeksMock).toHaveBeenCalledTimes(1);
      expect(daysToWeeksMock).toHaveBeenCalledWith(daysParams);
      expect(daysToMonthsMock).toHaveBeenCalledTimes(1);
      expect(daysToMonthsMock).toHaveBeenCalledWith(daysParams);
      expect(daysToYearsMock).toHaveBeenCalledTimes(1);
      expect(daysToYearsMock).toHaveBeenCalledWith(daysParams);

      expect(resultToDocMock).toHaveBeenCalledTimes(resultToDocResults.length);

      expect(createDocumentsMock).toHaveBeenCalledTimes(1);
      expect(createDocumentsMock).toHaveBeenCalledWith(
        createDocumentsParam,
        1000,
        100,
        0
      );
      expect(connectionMock.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('createDocuments()', () => {
    const index = Symbol('index');
    const query = Symbol('query');
    const executeBulkResult = Symbol('executeBulkResult');
    const getMetricIdResult = Symbol('getMetricIdResult');

    let getMetricIdMock;

    beforeEach(() => {
      configMock.getElasticMetricsIndex.mockReturnValueOnce(index);
      statsMock.createBulkQuery.mockReturnValueOnce(query);

      getMetricIdMock = jest.spyOn(IndexMongoStats, 'getMetricId');
      getMetricIdMock.mockReturnValueOnce(getMetricIdResult);
    });
    it('should create documents', async () => {
      // Given
      const docListMock = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunkLength = 3;
      const timePerRequest = 1;
      const delay = 2;

      statsMock.executeBulkQuery
        .mockResolvedValueOnce(executeBulkResult)
        .mockResolvedValueOnce(executeBulkResult)
        .mockResolvedValueOnce(executeBulkResult)
        .mockResolvedValueOnce(executeBulkResult);

      const resultsMock = [
        executeBulkResult,
        executeBulkResult,
        executeBulkResult,
        executeBulkResult,
      ];
      const createParams = {
        date: new Date(),
        range: new Date(),
        key: 42,
      };

      // When
      const result = await initMongoStats.createDocuments(
        docListMock,
        chunkLength,
        timePerRequest,
        delay
      );

      // Then
      const [firstCall] = statsMock.createBulkQuery.mock.calls;
      const [, , , lastParams] = firstCall;

      expect(lastParams(createParams)).toBe(getMetricIdResult);
      expect(getMetricIdMock).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(resultsMock);
    });
  });
});
