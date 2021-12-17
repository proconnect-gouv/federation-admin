import IndexMongoStats from '../../../src/jobs/IndexMongoStats';
import IndexUserStats, {
  isLastDayOfMonth,
} from '../../../src/jobs/IndexUserStats';
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

describe('isLastDay()', () => {
  it('should confirm the date is the last day of the month', () => {
    // Given
    // When
    const result = isLastDayOfMonth('2021-12-31');
    // Then
    expect(result).toBe(true);
  });
  it('should confirm the date is not the last day of the month', () => {
    // Given
    // When
    const result = isLastDayOfMonth('2021-12-30');
    // Then
    expect(result).toBe(false);
  });
});

describe('IndexUserStats', () => {
  let indexUserStats;

  const statsMock = {
    createBulkQuery: jest.fn(),
    executeBulkQuery: jest.fn(),
    getLastAccountNumber: jest.fn(),
    createMetricDocument: jest.fn(),
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

    indexUserStats = new IndexUserStats(container);
  });

  describe('usage()', () => {
    it('should return usage instruction', () => {
      // Given
      // When
      const usage = IndexUserStats.usage();
      // Then
      expect(usage).toBe(
        '\n      Usage:\n      > IndexUserStats --metric=<registration|identity>\n    '
      );
    });
  });

  describe('getData()', () => {
    let getInitRegistrationMock;

    const getInitRegistrationResult = Symbol('getInitRegistrationResult');
    beforeEach(() => {
      getInitRegistrationMock = jest.spyOn(
        IndexUserStats,
        'getInitRegistrationMetric'
      );
      getInitRegistrationMock.mockResolvedValueOnce(getInitRegistrationResult);
    });
    it('should get Registration metric', async () => {
      // Given
      const metric = 'registration';
      // When
      const result = await indexUserStats.getData(metric);
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
        indexUserStats.getData(metric)
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
        {
          $project: {
            _id: 0,
            date: '$_id',
            value: '$count',
          },
        },
        {
          $match: {
            $and: [
              {
                date: {
                  $ne: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                },
              },
              {
                date: {
                  $ne: null,
                },
              },
            ],
          },
        },
      ];
      // When
      const result = await IndexUserStats.getInitRegistrationMetric(
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
      const period = 'week';
      // When
      const result = IndexUserStats.periodReducer(period);
      // Then
      expect(typeof result).toBe('function');
    });
    it('should return an object when used as reducer', () => {
      // Given
      const period = 'week';
      // When
      const result = daysMock.reduce(IndexUserStats.periodReducer(period), {});
      // Then
      expect(typeof result).toBe('object');
    });
    it('should contain keys for each first day of weeks', () => {
      // Given
      const period = 'week';
      // When
      const result = daysMock.reduce(IndexUserStats.periodReducer(period), {});
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
      const periodReducerSpy = jest.spyOn(IndexUserStats, 'periodReducer');
      const period = 'week';
      // When
      IndexUserStats.daysToPeriod(daysMock, period);
      // Then
      expect(periodReducerSpy).toHaveBeenCalledTimes(1);
      expect(periodReducerSpy).toHaveBeenCalledWith(period);
    });
  });

  describe('daysToWeeks()', () => {
    it('should call IndexUserStats.daysToPeriod ', () => {
      // Given
      const IndexUserStatsSpy = jest.spyOn(IndexUserStats, 'daysToPeriod');
      // When
      IndexUserStats.daysToWeeks(daysMock);
      // Then
      expect(IndexUserStatsSpy).toHaveBeenCalledTimes(1);
      expect(IndexUserStatsSpy).toHaveBeenCalledWith(daysMock, 'week');
    });

    it('should return result from IndexUserStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const IndexUserStatsSpy = jest.spyOn(IndexUserStats, 'daysToPeriod');
      IndexUserStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = IndexUserStats.daysToWeeks(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return week aggregation', () => {
      // When
      const result = IndexUserStats.daysToWeeks(daysMock);
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
    it('should call IndexUserStats.daysToPeriod ', () => {
      // Given
      const IndexUserStatsSpy = jest.spyOn(IndexUserStats, 'daysToPeriod');
      // When
      IndexUserStats.daysToMonths(daysMock);
      // Then
      expect(IndexUserStatsSpy).toHaveBeenCalledTimes(1);
      expect(IndexUserStatsSpy).toHaveBeenCalledWith(daysMock, 'month');
    });

    it('should return result from IndexUserStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const IndexUserStatsSpy = jest.spyOn(IndexUserStats, 'daysToPeriod');
      IndexUserStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = IndexUserStats.daysToMonths(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return month aggregation', () => {
      // When
      const result = IndexUserStats.daysToMonths(daysMock);
      // Then
      expect(result).toEqual([
        { date: '2020-12-01', value: 50 },
        { date: '2021-01-01', value: 31 },
      ]);
    });
  });

  describe('daysToYears()', () => {
    it('should call IndexUserStats.daysToPeriod ', () => {
      // Given
      const IndexUserStatsSpy = jest.spyOn(IndexUserStats, 'daysToPeriod');
      // When
      IndexUserStats.daysToYears(daysMock);
      // Then
      expect(IndexUserStatsSpy).toHaveBeenCalledTimes(1);
      expect(IndexUserStatsSpy).toHaveBeenCalledWith(daysMock, 'year');
    });

    it('should return result from IndexUserStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const IndexUserStatsSpy = jest.spyOn(IndexUserStats, 'daysToPeriod');
      IndexUserStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = IndexUserStats.daysToYears(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return year aggregation', () => {
      // When
      const result = IndexUserStats.daysToYears(daysMock);
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
      const result = IndexUserStats.resultToDoc(input, key, range);
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

  describe('buildScaleFromMetrics', () => {
    let daysToWeeksMock;
    let daysToMonthsMock;
    let daysToYearsMock;
    let resultToDocMock;

    const daysToWeeksResult = Symbol('daysToWeeks');
    const daysToMonthsResult = Symbol('daysToMonths');
    const daysToYearsResult = Symbol('daysToYears');

    beforeEach(() => {
      daysToWeeksMock = jest.spyOn(IndexUserStats, 'daysToWeeks');
      daysToWeeksMock.mockReturnValueOnce(daysToWeeksResult);

      daysToMonthsMock = jest.spyOn(IndexUserStats, 'daysToMonths');
      daysToMonthsMock.mockReturnValueOnce(daysToMonthsResult);

      daysToYearsMock = jest.spyOn(IndexUserStats, 'daysToYears');
      daysToYearsMock.mockReturnValueOnce(daysToYearsResult);
      resultToDocMock = jest.spyOn(IndexUserStats, 'resultToDoc');
    });

    it('should build scales of values', () => {
      // Given
      const daysParams = [
        { date: 1, value: 42 },
        { date: 2, value: 43 },
        { date: 3, value: 44 },
      ];
      const keyMock = 'test';

      const resultToDocResults = [[1], [2], [3], [4]];
      resultToDocMock
        .mockReturnValueOnce(resultToDocResults[0])
        .mockReturnValueOnce(resultToDocResults[1])
        .mockReturnValueOnce(resultToDocResults[2])
        .mockReturnValueOnce(resultToDocResults[3]);

      const docListResult = [1, 2, 3, 4];

      // When
      const docList = IndexUserStats.buildScaleFromMetrics(daysParams, keyMock);

      // Then
      expect(docList).toEqual(docListResult);
      expect(daysToWeeksMock).toHaveBeenCalledTimes(1);
      expect(daysToWeeksMock).toHaveBeenCalledWith(daysParams);
      expect(daysToMonthsMock).toHaveBeenCalledTimes(1);
      expect(daysToMonthsMock).toHaveBeenCalledWith(daysParams);
      expect(daysToYearsMock).toHaveBeenCalledTimes(1);
      expect(daysToYearsMock).toHaveBeenCalledWith(daysParams);
    });
  });

  describe('selectDaysToRegister()', () => {
    it('should filter and sort the days to register', () => {
      // Given
      const metricDataMock = [
        { date: '2030-01-01' },
        { date: '1900-01-01' },
        { date: '2020-01-01' },
      ];
      const metricResult = [{ date: '2020-01-01' }, { date: '2030-01-01' }];

      const lastDayMock = '2019-01-01';

      // When
      const results = indexUserStats.selectDaysToRegister(
        metricDataMock,
        lastDayMock
      );

      // Then
      expect(results).toStrictEqual(metricResult);
    });
  });

  describe('fulfillMetrics()', () => {
    it('should add missing metrics if days are missing in values and reference date are out of metric dates', () => {
      const referenceDate = {
        start: '2000-09-30',
        stop: '2000-10-10',
      };
      // Given
      const metricsDataMock = [
        { date: '2000-10-01', value: 100 },
        { date: '2000-10-03', value: 1000 },
        { date: '2000-10-07', value: 10000 },
      ];
      const resultMock = [
        { date: '2000-09-30', value: 0 },
        { date: '2000-10-01', value: 100 },
        { date: '2000-10-02', value: 0 },
        { date: '2000-10-03', value: 1000 },
        { date: '2000-10-04', value: 0 },
        { date: '2000-10-05', value: 0 },
        { date: '2000-10-06', value: 0 },
        { date: '2000-10-07', value: 10000 },
        { date: '2000-10-08', value: 0 },
        { date: '2000-10-09', value: 0 },
        { date: '2000-10-10', value: 0 },
      ];

      // When
      const result = indexUserStats.fulfillMetrics(
        metricsDataMock,
        referenceDate
      );

      // Then
      expect(result).toStrictEqual(resultMock);
    });

    it('should get the same number of metrics if all days are presents', () => {
      // Given
      const referenceDate = {
        start: '2000-10-01',
        stop: '2000-10-07',
      };

      const metricsDataMock = [
        { date: '2000-10-01', value: 100 },
        { date: '2000-10-02', value: 200 },
        { date: '2000-10-03', value: 1000 },
        { date: '2000-10-04', value: 2000 },
        { date: '2000-10-05', value: 3000 },
        { date: '2000-10-06', value: 5000 },
        { date: '2000-10-07', value: 10000 },
      ];
      const resultMock = [
        { date: '2000-10-01', value: 100 },
        { date: '2000-10-02', value: 200 },
        { date: '2000-10-03', value: 1000 },
        { date: '2000-10-04', value: 2000 },
        { date: '2000-10-05', value: 3000 },
        { date: '2000-10-06', value: 5000 },
        { date: '2000-10-07', value: 10000 },
      ];

      // When
      const result = indexUserStats.fulfillMetrics(
        metricsDataMock,
        referenceDate
      );

      // Then
      expect(result).toStrictEqual(resultMock);
    });

    it('should add missing metrics if reference date are out of metric dates', () => {
      // Given
      const referenceDate = {
        start: '2000-09-28',
        stop: '2000-10-10',
      };

      const metricsDataMock = [
        { date: '2000-10-01', value: 100 },
        { date: '2000-10-02', value: 200 },
        { date: '2000-10-03', value: 1000 },
        { date: '2000-10-04', value: 2000 },
        { date: '2000-10-05', value: 3000 },
        { date: '2000-10-06', value: 5000 },
        { date: '2000-10-07', value: 10000 },
      ];
      const resultMock = [
        { date: '2000-09-28', value: 0 },
        { date: '2000-09-29', value: 0 },
        { date: '2000-09-30', value: 0 },
        { date: '2000-10-01', value: 100 },
        { date: '2000-10-02', value: 200 },
        { date: '2000-10-03', value: 1000 },
        { date: '2000-10-04', value: 2000 },
        { date: '2000-10-05', value: 3000 },
        { date: '2000-10-06', value: 5000 },
        { date: '2000-10-07', value: 10000 },
        { date: '2000-10-08', value: 0 },
        { date: '2000-10-09', value: 0 },
        { date: '2000-10-10', value: 0 },
      ];

      // When
      const result = indexUserStats.fulfillMetrics(
        metricsDataMock,
        referenceDate
      );

      // Then
      expect(result).toStrictEqual(resultMock);
    });
  });

  describe('computeMetricDocs()', () => {
    const paramsMock = {
      data: [
        { date: '2000-01-01', value: 100 },
        { date: '2000-06-01', value: 1000 },
        { date: '2000-12-31', value: 10000 },
      ],
      identities: 42,
      key: 'keyValue',
    };

    it('should compute the ES docs with identities count', () => {
      const resultsMock = [
        {
          date: '2000-01-01',
          key: 'keyValue',
          range: 'day',
          value: 142,
        },
        {
          date: '2000-06-01',
          key: 'keyValue',
          range: 'day',
          value: 1142,
        },
        {
          date: '2000-12-31',
          key: 'keyValue',
          range: 'day',
          value: 11142,
        },
        {
          date: '2000-12-31',
          key: 'keyValue',
          range: 'month',
          value: 11142,
        },
      ];
      const results = indexUserStats.computeMetricDocs(paramsMock);

      expect(results).toStrictEqual(resultsMock);
    });

    it('should present metrics informations in logs', () => {
      indexUserStats.computeMetricDocs(paramsMock);

      expect(loggerMock.info).toHaveBeenCalledTimes(3);
      expect(loggerMock.info).toHaveBeenNthCalledWith(
        1,
        ` > Current account number: 11142 persons`
      );
      expect(loggerMock.info).toHaveBeenNthCalledWith(
        2,
        ` > Number of daily docs to registered: 3`
      );
      expect(loggerMock.info).toHaveBeenNthCalledWith(
        3,
        ` > Number of monthly docs to registered: 1`
      );
    });
  });

  describe('buildAccountFromMetrics()', () => {
    let selectDaysMock;
    let fulfillMetricsMock;
    let computeMetricMock;

    const dataMock = [
      { date: '2000-01-01', value: 100 },
      { date: '2000-06-01', value: 1000 },
      { date: '2000-12-31', value: 10000 },
    ];
    const keyMock = 'keyValue';

    const lastAccountMock = {
      identities: 42,
      lastDate: '2020-01-01T00:00:00.000+00:00',
    };

    const selectedDaysMock = [
      { date: '2000-06-01', value: 1000 },
      { date: '2000-06-07', value: 10000 },
    ];

    const fulfillDaysMock = [
      { date: '2000-06-01', value: 1000 },
      { date: '2000-06-02', value: 1000 },
      { date: '2000-06-03', value: 1000 },
      { date: '2000-06-04', value: 1000 },
      { date: '2000-06-05', value: 1000 },
      { date: '2000-06-06', value: 1000 },
      { date: '2000-06-07', value: 10000 },
    ];

    const resultsMock = [
      {
        date: '2000-12-31',
        key: 'keyValue',
        range: 'day',
        value: 11142,
      },
      {
        date: '2000-12-31',
        key: 'keyValue',
        range: 'month',
        value: 11142,
      },
    ];

    beforeEach(() => {
      statsMock.getLastAccountNumber.mockResolvedValueOnce(lastAccountMock);

      selectDaysMock = jest.spyOn(indexUserStats, 'selectDaysToRegister');
      selectDaysMock.mockReturnValueOnce(selectedDaysMock);

      fulfillMetricsMock = jest.spyOn(indexUserStats, 'fulfillMetrics');
      fulfillMetricsMock.mockReturnValueOnce(fulfillDaysMock);

      computeMetricMock = jest.spyOn(indexUserStats, 'computeMetricDocs');
      computeMetricMock.mockReturnValueOnce(resultsMock);
    });

    it('should build docs for identity registration', async () => {
      // Given

      // When
      const docs = await indexUserStats.buildAccountFromMetrics(
        dataMock,
        keyMock
      );

      // Then
      expect(docs).toStrictEqual(resultsMock);

      expect(statsMock.getLastAccountNumber).toHaveBeenCalledTimes(1);
      expect(statsMock.getLastAccountNumber).toHaveBeenCalledWith({
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T00:00:00.000Z$/),
      });
      expect(selectDaysMock).toHaveBeenCalledTimes(1);
      expect(selectDaysMock).toHaveBeenCalledWith(
        dataMock,
        lastAccountMock.lastDate
      );

      expect(fulfillMetricsMock).toHaveBeenCalledTimes(1);
      expect(fulfillMetricsMock).toHaveBeenCalledWith(selectedDaysMock, {
        start: lastAccountMock.lastDate,
        stop: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T00:00:00.000Z$/),
      });

      expect(computeMetricMock).toHaveBeenCalledTimes(1);
      expect(computeMetricMock).toHaveBeenCalledWith({
        data: fulfillDaysMock,
        identities: lastAccountMock.identities,
        key: keyMock,
      });
    });

    it('should present metrics informations in logs', async () => {
      // Given
      // When
      await indexUserStats.buildAccountFromMetrics(dataMock, keyMock);

      // Then
      expect(loggerMock.info).toHaveBeenCalledTimes(2);
      expect(loggerMock.info).toHaveBeenNthCalledWith(
        1,
        expect.stringMatching(
          /^ > Select measure date : \d{4}-\d{2}-\d{2}T00:00:00.000Z$/
        )
      );
      expect(loggerMock.info).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(
          /^ > Last account number: 42 persons on \d{4}-\d{2}-\d{2}T00:00:00.000\+00:00$/
        )
      );
    });
  });

  describe('computeData()', () => {
    const identityMock = 'identity';
    const registrationMock = 'registration';

    let buildScaleMock;

    const metricData = [
      { date: 1, value: 42 },
      { date: 2, value: 43 },
      { date: 3, value: 44 },
    ];

    const scaleDataMock = [
      { key: registrationMock, date: '2019-01-12', value: 42, range: 'day' },
      { key: registrationMock, date: '2019-01-14', value: 90, range: 'week' },
      { key: registrationMock, date: '2019-01-16', value: 200, range: 'month' },
    ];

    let buildAccountMock;
    const accountDataMock = [
      { key: identityMock, date: '2019-02-01', value: 1337, range: 'day' },
      { key: identityMock, date: '2019-03-01', value: 1338, range: 'day' },
      { key: identityMock, date: '2019-04-01', value: 10000, range: 'month' },
    ];

    beforeEach(() => {
      buildScaleMock = jest.spyOn(IndexUserStats, 'buildScaleFromMetrics');
      buildScaleMock.mockReturnValueOnce(scaleDataMock);

      buildAccountMock = jest.spyOn(indexUserStats, 'buildAccountFromMetrics');
      buildAccountMock.mockResolvedValueOnce(accountDataMock);
    });
    it('should compute data with registration key', async () => {
      // Given
      // When
      const result = await indexUserStats.computeData(
        metricData,
        registrationMock
      );
      // Then
      expect(result).toStrictEqual(scaleDataMock);
      expect(buildScaleMock).toHaveBeenCalledTimes(1);
      expect(buildScaleMock).toHaveBeenCalledWith(metricData, registrationMock);

      expect(buildAccountMock).toHaveBeenCalledTimes(0);
    });

    it('should compute data with identity key', async () => {
      // Given
      // When
      const result = await indexUserStats.computeData(metricData, identityMock);
      // Then
      expect(result).toStrictEqual(accountDataMock);
      expect(buildAccountMock).toHaveBeenCalledTimes(1);
      expect(buildAccountMock).toHaveBeenCalledWith(metricData, identityMock);

      expect(buildScaleMock).toHaveBeenCalledTimes(0);
    });

    it('should failed to compute data with wrong key', async () => {
      // Given
      // When
      await expect(
        indexUserStats.computeData(metricData, 'pikachu')
        // Then
      ).rejects.toThrow(`Unknown metric: <pikachu>`);
      expect(buildAccountMock).toHaveBeenCalledTimes(0);
      expect(buildScaleMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('prepareDocs()', () => {
    it('should merge and prepare document for ES', () => {
      // Given
      const list = [1, 2, 10, 20, 100, 200];
      const resultMock = [2, 4, 20, 40, 200, 400];

      statsMock.createMetricDocument.mockImplementation(value => value * 2);

      // When
      const result = indexUserStats.prepareDocs(list);

      // then
      expect(result).toEqual(resultMock);
      expect(statsMock.createMetricDocument).toHaveBeenCalledTimes(
        resultMock.length
      );
    });
  });

  describe('run()', () => {
    const keyMock = 'registration';
    const methodMock = 'full';

    let getDataMock;
    const metricData = [
      { date: 1, value: 42 },
      { date: 2, value: 43 },
      { date: 3, value: 44 },
    ];

    let computeMock;
    const computeData = [
      { key: keyMock, date: '2019-01-12', value: 42, range: 'day' },
      { key: keyMock, date: '2019-01-14', value: 90, range: 'week' },
      { key: keyMock, date: '2019-01-16', value: 200, range: 'month' },
    ];

    let prepareDocsMock;
    const docData = [
      {
        key: keyMock,
        date: '2019-01-12T00:00:00:000Z',
        value: 42,
        range: 'day',
      },
      {
        key: keyMock,
        date: '2019-01-14T00:00:00:000Z',
        value: 90,
        range: 'week',
      },
      {
        key: keyMock,
        date: '2019-01-16T00:00:00:000Z',
        value: 200,
        range: 'month',
      },
    ];

    let createDocumentsMock;

    const schemaMock = {
      metric: { mandatory: true, type: 'string' },
    };

    beforeEach(() => {
      getDataMock = jest.spyOn(indexUserStats, 'getData');
      getDataMock.mockResolvedValueOnce(metricData);

      computeMock = jest.spyOn(indexUserStats, 'computeData');
      computeMock.mockResolvedValueOnce(computeData);

      prepareDocsMock = jest.spyOn(indexUserStats, 'prepareDocs');
      prepareDocsMock.mockReturnValueOnce(docData);

      createDocumentsMock = jest.spyOn(indexUserStats, 'createDocuments');
      createDocumentsMock.mockReturnValueOnce();
    });

    it('should run the program', async () => {
      // Given
      inputMock.get.mockReturnValueOnce({
        metric: keyMock,
        method: methodMock,
      });

      const paramsMock = Symbol('params');

      // When
      await indexUserStats.run(paramsMock);

      // Then
      expect(loggerMock.info).toHaveBeenCalledTimes(7);
      expect(inputMock.get).toHaveBeenCalledTimes(1);
      expect(inputMock.get).toHaveBeenCalledWith(schemaMock, paramsMock);
      expect(getDataMock).toHaveBeenCalledTimes(1);
      expect(getDataMock).toHaveBeenCalledWith(keyMock);

      expect(computeMock).toHaveBeenCalledTimes(1);
      expect(computeMock).toHaveBeenCalledWith(metricData, keyMock);

      expect(prepareDocsMock).toHaveBeenCalledTimes(1);
      expect(prepareDocsMock).toHaveBeenCalledWith(computeData);

      expect(createDocumentsMock).toHaveBeenCalledTimes(1);
      expect(createDocumentsMock).toHaveBeenCalledWith(docData, 1000, 100, 0);
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
      const result = await indexUserStats.createDocuments(
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
