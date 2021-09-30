import IndexMongoStats from '../../../src/jobs/IndexMongoStats';
import Container from '../../../src/services/Container';

describe('IndexMongoStats', () => {
  const statsMock = {
    createMetricDocument: jest.fn(),
    index: jest.fn(),
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

  const clientMock = {
    countDocuments: jest.fn(),
  };
  const accountMock = {
    countDocuments: jest.fn(),
  };

  const connectionMock = { close: jest.fn() };

  const fcDatabaseMock = {
    models: {
      account: accountMock,
      client: clientMock,
    },
    connections: [connectionMock],
  };

  const container = new Container();
  container.add('logger', () => loggerMock);
  container.add('stats', () => statsMock);
  container.add('config', () => configMock);
  container.add('input', () => inputMock);
  container.add('fcDatabase', () => Promise.resolve(fcDatabaseMock));

  let indexMongoStats;
  const countDocumentsMock = Symbol('countDocuments');

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    indexMongoStats = new IndexMongoStats(container);
    accountMock.countDocuments.mockResolvedValueOnce(countDocumentsMock);
    clientMock.countDocuments.mockResolvedValueOnce(countDocumentsMock);
  });
  describe('usage()', () => {
    it('should display usage', () => {
      // Given
      const resultMock =
        '\n      Usage:\n      > IndexMongoStats --count=<account|activeFsCount|desactivated|registration> --start=<<YYYY-MM-DD>> --range=<day|week|month|year>';
      // When
      const result = IndexMongoStats.usage();
      // Then
      expect(result).toBe(resultMock);
    });
  });

  describe('getMetric()', () => {
    const getActiveResult = Symbol('getActiveResult');
    const getRegistrationResult = Symbol('getRegistrationResult');
    let getActiveFsMetricMock;
    let getRegistrationMetricMock;

    const start = '2021-09-16';
    const range = Symbol('range');

    beforeEach(() => {
      getActiveFsMetricMock = jest.spyOn(IndexMongoStats, 'getActiveFsMetric');
      getActiveFsMetricMock.mockResolvedValueOnce(getActiveResult);

      getRegistrationMetricMock = jest.spyOn(
        IndexMongoStats,
        'getRegistrationMetric'
      );
      getRegistrationMetricMock.mockResolvedValueOnce(getRegistrationResult);
    });

    it('should get metric from account', async () => {
      // Given
      const metric = 'account';
      // When
      const result = await indexMongoStats.getMetric(metric, start, range);
      // Then
      expect(result).toBe(countDocumentsMock);
      expect(accountMock.countDocuments).toHaveBeenCalledTimes(1);
      expect(accountMock.countDocuments).toHaveBeenCalledWith({
        createdAt: { $lte: start },
      });
    });

    it('should get metric from activeFsCount', async () => {
      // Given
      const metric = 'activeFsCount';
      // When
      const result = await indexMongoStats.getMetric(metric, start, range);
      // Then
      expect(result).toBe(getActiveResult);
      expect(getActiveFsMetricMock).toHaveBeenCalledTimes(1);
      expect(getActiveFsMetricMock).toHaveBeenCalledWith(
        clientMock,
        start,
        range
      );
    });
    it('should get metric from desactivated', async () => {
      // Given
      const metric = 'desactivated';
      // When
      const result = await indexMongoStats.getMetric(metric, start, range);
      // Then
      expect(result).toBe(countDocumentsMock);
      expect(accountMock.countDocuments).toHaveBeenCalledTimes(1);
      expect(accountMock.countDocuments).toHaveBeenCalledWith({
        active: false,
      });
    });
    it('should get metric from registration', async () => {
      // Given
      const metric = 'registration';
      // When
      const result = await indexMongoStats.getMetric(metric, start, range);
      // Then
      expect(result).toBe(getRegistrationResult);
      expect(getRegistrationMetricMock).toHaveBeenCalledTimes(1);
      expect(getRegistrationMetricMock).toHaveBeenCalledWith(
        accountMock,
        start,
        range
      );
    });

    it('should failed if metric is unknown', async () => {
      // Given
      const metric = 'Darth Vador';
      await expect(
        // When
        indexMongoStats.getMetric(metric, start, range)
        // Then
      ).rejects.toThrow(`Unknown metric: <${metric}>`);
    });
  });

  describe('getActiveFsMetric()', () => {
    let getStopDateForRangeMock;

    const stopMock = new Date('2021-09-16');

    beforeEach(() => {
      getStopDateForRangeMock = jest.spyOn(
        IndexMongoStats,
        'getStopDateForRange'
      );
      getStopDateForRangeMock.mockReturnValueOnce(stopMock);
    });

    it('should get metrics of active fs', async () => {
      const start = '2021-09-16';
      const range = Symbol('range');

      const resultMock = {
        $and: [
          { createdAt: { $gte: new Date('2021-09-16T00:00:00.000Z') } },
          { createdAt: { $lt: new Date('2021-09-16T00:00:00.000Z') } },
        ],
        active: true,
      };
      const result = await IndexMongoStats.getActiveFsMetric(
        clientMock,
        start,
        range
      );

      expect(result).toBe(countDocumentsMock);
      expect(clientMock.countDocuments).toHaveBeenCalledTimes(1);
      expect(clientMock.countDocuments).toHaveBeenCalledWith(resultMock);
    });
  });

  describe('getRegistrationMetric()', () => {
    let getStopDateForRangeMock;

    const stopMock = new Date('2021-09-16');

    beforeEach(() => {
      getStopDateForRangeMock = jest.spyOn(
        IndexMongoStats,
        'getStopDateForRange'
      );
      getStopDateForRangeMock.mockReturnValueOnce(stopMock);
    });

    it('should get registration metrics', async () => {
      const start = '2021-09-16';
      const range = Symbol('range');

      const resultMock = {
        $and: [
          { createdAt: { $gte: new Date('2021-09-16T00:00:00.000Z') } },
          { createdAt: { $lt: new Date('2021-09-16T00:00:00.000Z') } },
        ],
      };
      const result = await IndexMongoStats.getRegistrationMetric(
        accountMock,
        start,
        range
      );

      expect(result).toBe(countDocumentsMock);
      expect(accountMock.countDocuments).toHaveBeenCalledTimes(1);
      expect(accountMock.countDocuments).toHaveBeenCalledWith(resultMock);
    });
  });

  describe('getMetricId()', () => {
    it('Should return same output with same input', () => {
      // Given
      const inputA = { key: 'foo', date: 'bar', range: 'day' };
      const inputB = { key: 'foo', date: 'bar', range: 'day' };
      // When
      const hashA = IndexMongoStats.getMetricId(inputA);
      const hashB = IndexMongoStats.getMetricId(inputB);
      // Then
      expect(hashA).toEqual(hashB);
    });
    it('Should return different output with different input', () => {
      // Given
      const inputA = { key: 'foo', date: 'bar', range: 'day' };
      const inputB = { key: 'foo', date: 'baz', range: 'day' };
      // When
      const hashA = IndexMongoStats.getMetricId(inputA);
      const hashB = IndexMongoStats.getMetricId(inputB);
      // Then
      expect(hashA).not.toEqual(hashB);
    });
    it('Should return different output with different range', () => {
      // Given
      const inputA = { key: 'foo', date: 'bar', range: 'day' };
      const inputB = { key: 'foo', date: 'bar', range: 'week' };
      // When
      const hashA = IndexMongoStats.getMetricId(inputA);
      const hashB = IndexMongoStats.getMetricId(inputB);
      // Then
      expect(hashA).not.toEqual(hashB);
    });
  });

  describe('getStopDateForRange()', () => {
    it('Sould return date + 1 day', () => {
      // Given
      const start = '2019-10-25';
      const range = 'day';
      // When
      const stop = IndexMongoStats.getStopDateForRange(start, range);
      // Then
      expect(stop).toBe('2019-10-26');
    });
    it('Sould return date + 1 week', () => {
      // Given
      const start = '2019-10-25';
      const range = 'week';
      // When
      const stop = IndexMongoStats.getStopDateForRange(start, range);
      // Then
      expect(stop).toBe('2019-11-01');
    });
    it('Sould return date + 1 month', () => {
      // Given
      const start = '2019-10-01';
      const range = 'month';
      // When
      const stop = IndexMongoStats.getStopDateForRange(start, range);
      // Then
      expect(stop).toBe('2019-11-01');
    });
    it('Sould return date + 1 year', () => {
      // Given
      const start = '2019-10-25';
      const range = 'year';
      // When
      const stop = IndexMongoStats.getStopDateForRange(start, range);
      // Then
      expect(stop).toBe('2020-10-25');
    });
  });

  describe('run()', () => {
    let getMetricMock;
    let getMetricIdMock;

    const countMock = Symbol('count');
    const startMock = Symbol('start');
    const rangeMock = Symbol('range');

    const inputs = {
      count: countMock,
      start: startMock,
      range: rangeMock,
    };

    const schemaMock = {
      count: { type: 'string', mandatory: true },
      start: { type: 'date', mandatory: true },
      range: { type: 'timeRange', mandatory: true },
    };
    const valueMock = Symbol('value');
    const docMock = Symbol('doc');
    const idMock = Symbol('id');
    const indexMock = Symbol('index');

    beforeEach(async () => {
      inputMock.get.mockReturnValueOnce(inputs);
      getMetricMock = jest.spyOn(indexMongoStats, 'getMetric');
      getMetricMock.mockReturnValueOnce(valueMock);
      statsMock.createMetricDocument.mockReturnValueOnce(docMock);
      getMetricIdMock = jest.spyOn(IndexMongoStats, 'getMetricId');
      getMetricIdMock.mockReturnValueOnce(idMock);
      configMock.getElasticMetricsIndex.mockReturnValueOnce(indexMock);
    });
    it('should run', async () => {
      // Given
      const params = Symbol('params');
      const createDocumentsMock = {
        key: countMock,
        value: valueMock,
        date: startMock,
        range: rangeMock,
      };
      // When
      await indexMongoStats.run(params);
      // Then
      expect(loggerMock.info).toHaveBeenCalledTimes(8);
      expect(inputMock.get).toHaveBeenCalledTimes(1);
      expect(inputMock.get).toHaveBeenCalledWith(schemaMock, params);
      expect(getMetricMock).toHaveBeenCalledTimes(1);
      expect(getMetricMock).toHaveBeenCalledWith(
        countMock,
        startMock,
        rangeMock
      );
      expect(statsMock.createMetricDocument).toHaveBeenCalledTimes(1);
      expect(statsMock.createMetricDocument).toHaveBeenCalledWith(
        createDocumentsMock
      );
      expect(getMetricIdMock).toHaveBeenCalledTimes(1);
      expect(getMetricIdMock).toHaveBeenCalledWith(docMock);
      expect(configMock.getElasticMetricsIndex).toHaveBeenCalledTimes(1);
      expect(statsMock.index).toHaveBeenCalledTimes(1);
      expect(statsMock.index).toHaveBeenCalledWith(docMock, indexMock, idMock);
      expect(connectionMock.close).toHaveBeenCalledTimes(1);
    });
  });
});
