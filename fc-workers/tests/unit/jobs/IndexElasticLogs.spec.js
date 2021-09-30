import IndexElasticLogs from '../../../src/jobs/IndexElasticLogs';
import Container from '../../../src/services/Container';

describe('IndexElasticLogs', () => {
  const statsMock = {
    executeBulkQuery: jest.fn(),
    createBulkQuery: jest.fn(),
    getByIntervalByFIFS: jest.fn(),
  };

  const loggerMock = {
    info: jest.fn(),
  };

  const configMock = {
    getElasticEventsIndex: jest.fn(),
  };

  const inputMock = {
    get: jest.fn(),
  };

  const container = new Container();
  container.add('logger', () => loggerMock);
  container.add('stats', () => statsMock);
  container.add('config', () => configMock);
  container.add('input', () => inputMock);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('usage()', () => {
    it('should return usage instruction', () => {
      // Given
      // When
      const usage = IndexElasticLogs.usage();
      // Then
      expect(usage).toBe(
        '\n      Usage:\n      > IndexElasticLogs --start=<YYYY-MM-DD> --stop=<YYYY-MM-DD>\n    '
      );
    });
  });

  describe('fetchData()', () => {
    let indexElasticLogs;

    beforeEach(() => {
      indexElasticLogs = new IndexElasticLogs(container);
    });
    it('it should return ES query based on date params', async () => {
      // Given
      const start = 'startValue';
      const stop = 'stopValue';
      const size = 42;
      const after = true;
      const queryMock = Symbol('query');
      statsMock.getByIntervalByFIFS.mockReturnValueOnce(queryMock);

      // When
      const query = await indexElasticLogs.fetchData(start, stop, size, after);

      // Then
      expect(query).toBe(queryMock);
      expect(statsMock.getByIntervalByFIFS).toHaveBeenCalledTimes(1);
      expect(statsMock.getByIntervalByFIFS).toHaveBeenCalledWith(
        start,
        stop,
        'day',
        size,
        after
      );
    });
  });
  describe('getKey', () => {
    it('Should return key with given entry', () => {
      // Given
      const entry = {
        date: 'a',
        action: 'b',
        fs: 'c',
        fi: 'd',
        useless: 'e',
        typeAction: 'f',
      };
      // When
      const result = IndexElasticLogs.getKey(entry);
      // Then
      expect(result).toBe(
        'b5bb74829f241ce0bfbb2f30ee943315685a5dfb026148751aa43765b2ccd2ae'
      );
    });

    it('Should return key even if some parameters are missing', () => {
      // Given
      const entry = {
        date: 'a',
        action: 'b',
        fi: 'd',
        useless: 'e',
      };
      // When
      const result = IndexElasticLogs.getKey(entry);
      // Then
      expect(result).toBe(
        '3a9a27468a8e02a40e4fa4f2819f2fd90e34699fa60c4e6d28b22ef574501391'
      );
    });

    it('Should return same keys if two entries have the same values', () => {
      // Given
      const entry1 = {
        date: 'a',
        action: 'b',
        fi: 'd',
        useless: 'e',
      };
      const entry2 = {
        date: 'a',
        fsId: 'b',
        fiId: 'd',
        useless: 'e',
      };
      // When
      const result1 = IndexElasticLogs.getKey(entry1);
      const result2 = IndexElasticLogs.getKey(entry2);
      // Then
      expect(result1).toBe(
        '3a9a27468a8e02a40e4fa4f2819f2fd90e34699fa60c4e6d28b22ef574501391'
      );
      expect(result1).toBe(result2);
    });
  });

  describe('getIndexationStats', () => {
    it('Should return a number', () => {
      // Given
      const input = [];
      // When
      const result = IndexElasticLogs.getIndexationStats(input);
      // Then
      expect(typeof result).toBe('number');
    });
    it('Should return the sum of sub arrays', () => {
      // Given
      const input = [
        { body: { items: new Array(2) } },
        { body: { items: new Array(2) } },
        { body: { items: new Array(2) } },
      ];
      // When
      const result = IndexElasticLogs.getIndexationStats(input);
      // Then
      expect(result).toBe(6);
    });
  });

  describe('getEventCountFromAggregates', () => {
    it('Should return a number', () => {
      // Given
      const input = [];
      // When
      const result = IndexElasticLogs.getEventCountFromAggregates(input);
      // Then
      expect(typeof result).toBe('number');
    });

    it('Should return the sum of all count properties', () => {
      // Given
      const input = [{ count: 1 }, { count: 2 }, { count: 3 }];
      // When
      const result = IndexElasticLogs.getEventCountFromAggregates(input);
      // Then
      expect(result).toBe(6);
    });
  });

  describe('createDocuments', () => {
    beforeEach(() => {
      configMock.getElasticEventsIndex.mockReturnValueOnce('indexValue');
    });

    it('Should call executeQuery as many time as there are chunks', async () => {
      // Given
      const docList = [
        { id: 'a', a: 1 },
        { id: 'b', c: 2 },
        { id: 'c', c: 3 },
        { id: 'd', c: 4 },
      ];
      const chunkLength = 2;
      const delay = 0;
      const job = new IndexElasticLogs(container);
      // When
      await job.createDocuments(docList, chunkLength, delay);
      // Then
      expect(statsMock.createBulkQuery).toHaveBeenCalledTimes(2);
      expect(statsMock.executeBulkQuery).toHaveBeenCalledTimes(2);
    });

    it('Should call executeQuery with the right index', async () => {
      // Given
      const docList = [{ id: 'a', a: 1 }];
      const chunkLength = 1;
      const delay = 0;
      const job = new IndexElasticLogs(container);
      // When
      await job.createDocuments(docList, chunkLength, delay);
      // Then
      expect(configMock.getElasticEventsIndex).toHaveBeenCalledTimes(1);
    });
  });

  describe('indexLogs()', () => {
    const bucketsMock = [
      {
        key: {
          date: new Date(),
          action: 'actionValue1',
          type_action: 'typeActionValue1',
          fs: 'fsValue',
          fi: 'fiValue',
        },
        doc_count: 3,
      },
      {
        key: {
          date: new Date(),
          action: 'actionValue2',
          type_action: 'typeActionValue2',
          fs: 'fsValue',
          fi: 'fiValue',
        },
        doc_count: 3,
      },
    ];

    const dataMock = {
      body: {
        aggregations: {
          date: {
            buckets: bucketsMock,
            after_key: false,
          },
        },
      },
    };

    const resultsMock = Symbol('results');
    const indexElasticLogs = new IndexElasticLogs(container);

    let fetchDataMock;
    let getKeyMock;
    let getEventCountFromAggregatesMock;
    let createDocumentsMock;
    let getIndexationStatsMock;

    beforeEach(() => {
      fetchDataMock = jest.spyOn(indexElasticLogs, 'fetchData');
      getKeyMock = jest.spyOn(IndexElasticLogs, 'getKey');
      getEventCountFromAggregatesMock = jest.spyOn(
        IndexElasticLogs,
        'getEventCountFromAggregates'
      );
      createDocumentsMock = jest.spyOn(indexElasticLogs, 'createDocuments');
      getIndexationStatsMock = jest.spyOn(
        IndexElasticLogs,
        'getIndexationStats'
      );

      fetchDataMock.mockResolvedValueOnce(dataMock);
      getKeyMock.mockReturnValueOnce(42);
      createDocumentsMock.mockResolvedValueOnce(resultsMock);

      getIndexationStatsMock.mockReturnValueOnce(666);

      getEventCountFromAggregatesMock
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(20);
    });

    it('should create indexed logs', async () => {
      const start = 'startValue';
      const stop = 'stopValue';
      const after = null;
      const initialDelay = 0;

      await indexElasticLogs.indexLogs(start, stop, after, initialDelay);

      expect(loggerMock.info).toHaveBeenCalledTimes(6);
      expect(fetchDataMock).toHaveBeenCalledTimes(1);
      expect(getKeyMock).toHaveBeenCalledTimes(bucketsMock.length);
      expect(createDocumentsMock).toHaveBeenCalledTimes(1);
      expect(getEventCountFromAggregatesMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('run()', () => {
    const indexElasticLogs = new IndexElasticLogs(container);

    let indexLogsMock;

    beforeEach(() => {
      indexLogsMock = jest.spyOn(indexElasticLogs, 'indexLogs');
    });

    it('should run the script', async () => {
      // Given
      const start = 'startValue';
      const stop = 'stopValue';
      const paramsMock = {
        start,
        stop,
      };

      const schema = {
        start: { type: 'date', mandatory: true },
        stop: { type: 'date', mandatory: true },
      };
      indexLogsMock.mockReturnValueOnce(true);

      inputMock.get.mockImplementationOnce((_schema, params) => params);

      // When
      await indexElasticLogs.run(paramsMock);

      // Then
      expect(inputMock.get).toHaveBeenCalledTimes(1);
      expect(inputMock.get).toHaveBeenCalledWith(schema, paramsMock);

      expect(indexLogsMock).toHaveBeenCalledTimes(1);
      expect(indexLogsMock).toHaveBeenCalledWith(start, stop);
    });
  });
});
