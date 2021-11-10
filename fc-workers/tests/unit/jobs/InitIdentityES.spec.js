import IndexMongoStats from '../../../src/jobs/IndexMongoStats';
import InitIdentityES, { HISTORICALS } from '../../../src/jobs/InitIdentityES';
import Container from '../../../src/services/Container';

describe('InitIdentityES', () => {
  let initIdentityES;

  const statsMock = {
    createBulkQuery: jest.fn(),
    executeBulkQuery: jest.fn(),
  };

  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const configMock = {
    getElasticMetricsIndex: jest.fn(),
  };

  const container = new Container();
  container.add('logger', () => loggerMock);
  container.add('stats', () => statsMock);
  container.add('config', () => configMock);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    initIdentityES = new InitIdentityES(container);
  });
  describe('usage()', () => {
    it('should return usage instruction', () => {
      // Given
      // When
      const usage = InitIdentityES.usage();

      // Then
      expect(usage).toBe('\n    Usage:\n    > InitIdentityES');
    });
  });
  describe('buildDocuments()', () => {
    it('should build documents from Historicals data', () => {
      // Given
      const rawDataMock = [
        {
          date: '2019-01-01',
          hello: 'world1',
        },
        {
          date: '2020-06-01',
          hello: 'world2',
        },
        {
          date: '2030-12-01',
          hello: 'world3',
        },
      ];
      const resultMock = [
        {
          date: '2019-01-01T00:00:00.000Z',
          hello: 'world1',
          key: 'identity',
          range: 'month',
        },
        {
          date: '2020-06-01T00:00:00.000Z',
          hello: 'world2',
          key: 'identity',
          range: 'month',
        },
        {
          date: '2030-12-01T00:00:00.000Z',
          hello: 'world3',
          key: 'identity',
          range: 'month',
        },
      ];

      // When
      const docs = initIdentityES.buildDocuments(rawDataMock);

      // Then
      expect(docs).toStrictEqual(resultMock);
    });
  });

  describe('injectHistoric()', () => {
    let buildDocumentsMock;

    const resultMock = [
      {
        date: '2019-01-01T00:00:00.000Z',
        hello: 'world1',
        key: 'identity',
        range: 'month',
      },
      {
        date: '2020-06-01T00:00:00.000Z',
        hello: 'world2',
        key: 'identity',
        range: 'month',
      },
      {
        date: '2030-12-01T00:00:00.000Z',
        hello: 'world3',
        key: 'identity',
        range: 'month',
      },
    ];
    const indexMock = Symbol('index');
    const queriesMock = [
      Symbol('queries1'),
      Symbol('queries2'),
      Symbol('queries3'),
    ];

    let getMetricIdMock;
    const getMetricIdResult = Symbol('getMetricIdResult');

    beforeEach(() => {
      buildDocumentsMock = jest.spyOn(initIdentityES, 'buildDocuments');
      buildDocumentsMock.mockReturnValueOnce(resultMock);

      configMock.getElasticMetricsIndex.mockReturnValueOnce(indexMock);

      statsMock.createBulkQuery.mockReturnValueOnce(queriesMock);

      getMetricIdMock = jest.spyOn(IndexMongoStats, 'getMetricId');
      getMetricIdMock.mockReturnValueOnce(getMetricIdResult);
    });

    it('should inject historic values on ES metrics', async () => {
      // Given
      const createParams = {
        date: new Date(),
        range: new Date(),
        key: 42,
      };

      // When
      await initIdentityES.injectHistoric(resultMock);

      // Then
      expect(loggerMock.info).toHaveBeenCalledTimes(3);
      expect(buildDocumentsMock).toHaveBeenCalledTimes(1);
      expect(buildDocumentsMock).toHaveBeenCalledWith(HISTORICALS);
      expect(statsMock.createBulkQuery).toHaveBeenCalledTimes(1);
      expect(statsMock.createBulkQuery).toHaveBeenCalledWith(
        resultMock,
        'index',
        indexMock,
        expect.any(Function)
      );

      const [firstCall] = statsMock.createBulkQuery.mock.calls;
      const [, , , lastParams] = firstCall;

      expect(lastParams(createParams)).toBe(getMetricIdResult);
      expect(getMetricIdMock).toHaveBeenCalledTimes(1);

      expect(statsMock.executeBulkQuery).toHaveBeenCalledTimes(1);
      expect(statsMock.executeBulkQuery).toHaveBeenCalledWith(queriesMock);
    });
  });

  describe('run()', () => {
    let injectHistoricMock;
    let mockExit;

    beforeEach(() => {
      injectHistoricMock = jest.spyOn(initIdentityES, 'injectHistoric');
      mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    });
    it('should run the program', async () => {
      // Given
      injectHistoricMock.mockResolvedValueOnce();
      // When
      await initIdentityES.run();

      // Then
      expect(injectHistoricMock).toHaveBeenCalledTimes(1);
      expect(injectHistoricMock).toHaveBeenCalledWith();

      expect(loggerMock.info).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).toHaveBeenCalledWith('All done');
    });

    it('should failed to run the program', async () => {
      // Given
      const errorMock = new Error('Unknown Error');
      injectHistoricMock.mockImplementation(() => {
        throw errorMock;
      });

      // When
      await initIdentityES.run();

      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(loggerMock.error).toHaveBeenCalledWith(errorMock);
      expect(mockExit).toHaveBeenCalledTimes(1);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
