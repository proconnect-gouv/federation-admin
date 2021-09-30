import PurgeES from '../../../src/jobs/PurgeES';
import Container from '../../../src/services/Container';

describe('PurgeES', () => {
  let purgeES;

  const statsMock = {
    getIdsToDelete: jest.fn(),
  };

  const loggerMock = {
    info: jest.fn(),
  };

  const configMock = {
    getElasticEventsIndex: jest.fn(),
    getElasticMainIndex: jest.fn(),
  };

  const inputMock = {
    get: jest.fn(),
  };

  const dataApiMock = {
    bulk: jest.fn(),
  };

  const container = new Container();
  container.add('logger', () => loggerMock);
  container.add('stats', () => statsMock);
  container.add('config', () => configMock);
  container.add('input', () => inputMock);
  container.add('dataApi', () => dataApiMock);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    purgeES = new PurgeES(container);
  });

  describe('usage()', () => {
    it('should return usage instruction', () => {
      // Given
      // When
      const usage = PurgeES.usage();
      // Then
      expect(usage).toBe('\n      Usage:\n      > PurgeES\n    ');
    });
  });
  describe('getBulk()', () => {
    const getIdsToResult = Symbol('getIdsToResult');

    beforeEach(() => {
      statsMock.getIdsToDelete.mockResolvedValueOnce(getIdsToResult);
    });

    it('should get the ids to delete', async () => {
      // Given
      const params = Symbol('params');

      // When
      const result = await purgeES.getBulk(params);

      // Then
      expect(result).toBe(getIdsToResult);
      expect(statsMock.getIdsToDelete).toHaveBeenCalledTimes(1);
    });
  });
  describe('createBulkDeleteQuery()', () => {
    it('Should return a bulk delete query', () => {
      // Given
      const input = [1, 2];
      const index = 'Harpagon';
      // When
      const result = PurgeES.createBulkDeleteQuery(input, index);
      // Then
      expect(result).toEqual({
        body: [
          { delete: { _index: index, _type: 'log', _id: 1 } },
          { delete: { _index: index, _type: 'log', _id: 2 } },
        ],
      });
    });
  });

  describe('sendBulkQuery()', () => {
    it('should bulk query', async () => {
      // Given
      const query = Symbol('query');
      const dataResult = Symbol('dataResult');
      dataApiMock.bulk.mockResolvedValueOnce(dataResult);
      // When
      const result = await purgeES.sendBulkQuery(query);
      // Then
      expect(result).toBe(dataResult);
      expect(dataApiMock.bulk).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleProgress()', () => {
    it('Should log progress', () => {
      purgeES.recursiveDelete = jest.fn();
      const params = {
        total: 10,
        counter: 1,
        wait: 0,
      };
      const bulk = {
        ids: [1, 2],
        total: 8,
      };
      // When
      purgeES.handleProgress(params, bulk);
      // Then
      expect(loggerMock.info.mock.calls).toHaveLength(1);
      expect(loggerMock.info.mock.calls[0][0]).toBe(
        `[40%] Sent delete for 2 docs. Remaining docs: 6 / 10`
      );
    });

    it('Should log progress with bulk params', () => {
      purgeES.recursiveDelete = jest.fn();
      const params = {
        counter: 1,
        wait: 0,
      };
      const bulk = {
        ids: [1, 2],
        total: 8,
      };
      // When
      purgeES.handleProgress(params, bulk);
      // Then
      expect(loggerMock.info.mock.calls).toHaveLength(1);
      expect(loggerMock.info.mock.calls[0][0]).toBe(
        `[25%] Sent delete for 2 docs. Remaining docs: 6 / 8`
      );
    });
    it('Should call recursiveDelete', done => {
      purgeES.recursiveDelete = jest.fn();
      const params = {
        total: 10,
        counter: 1,
        wait: 0,
      };
      const bulk = {
        ids: [1, 2],
        total: 8,
      };
      // When
      purgeES.handleProgress(params, bulk);
      // Then

      setTimeout(() => {
        expect(purgeES.recursiveDelete.mock.calls).toHaveLength(1);
        expect(purgeES.recursiveDelete.mock.calls[0][0]).toEqual({
          total: 10,
          counter: 2,
          wait: 0,
        });
        done();
      }, 50);
    });
    it('Should not call recursiveDelete', done => {
      purgeES.recursiveDelete = jest.fn();
      const params = {
        total: 10,
        counter: 4,
        wait: 0,
      };
      const bulk = {
        ids: [1, 2],
        total: 2,
      };
      // When
      purgeES.handleProgress(params, bulk);
      // Then
      setTimeout(() => {
        expect(purgeES.recursiveDelete.mock.calls).toHaveLength(0);
        done();
      }, 50);
    });
  });

  describe('recursiveDelete()', () => {
    let getBulkMock;
    let createBulkDeleteQueryMock;
    let sendBulkQueryMock;
    let handleProgressMock;

    const getBulkResult = {
      ids: Symbol('ids'),
    };

    const sendBulkResult = Symbol('sendBulkResult');
    const handleProgressResult = Symbol('handleProgressResult');

    const index = Symbol('index');

    beforeEach(() => {
      getBulkMock = jest.spyOn(purgeES, 'getBulk');
      getBulkMock.mockResolvedValueOnce(getBulkResult);

      createBulkDeleteQueryMock = jest.spyOn(PurgeES, 'createBulkDeleteQuery');

      sendBulkQueryMock = jest.spyOn(purgeES, 'sendBulkQuery');
      sendBulkQueryMock.mockResolvedValueOnce(sendBulkResult);

      handleProgressMock = jest.spyOn(purgeES, 'handleProgress');
      handleProgressMock.mockResolvedValueOnce(handleProgressResult);

      configMock.getElasticMainIndex.mockReturnValueOnce(index);
    });
    it('should delete data if there are ids', async () => {
      // Given
      const params = Symbol('params');

      const createBulkResult = {
        body: [{ test: 'hello' }],
      };
      createBulkDeleteQueryMock.mockReturnValueOnce(createBulkResult);

      // When
      await purgeES.recursiveDelete(params);

      // Then
      expect(getBulkMock).toHaveBeenCalledTimes(1);
      expect(getBulkMock).toHaveBeenCalledWith(params);
      expect(configMock.getElasticMainIndex).toHaveBeenCalledTimes(1);

      expect(createBulkDeleteQueryMock).toHaveBeenCalledTimes(1);
      expect(createBulkDeleteQueryMock).toHaveBeenCalledWith(
        getBulkResult.ids,
        index
      );
      expect(sendBulkQueryMock).toHaveBeenCalledTimes(1);
      expect(sendBulkQueryMock).toHaveBeenCalledWith(createBulkResult);

      expect(handleProgressMock).toHaveBeenCalledTimes(1);
      expect(handleProgressMock).toHaveBeenCalledWith(params, getBulkResult);
    });
    it('should not delete data if there is no id', async () => {
      // Given
      const params = Symbol('params');

      const createBulkResult = {
        body: [],
      };
      createBulkDeleteQueryMock.mockReturnValueOnce(createBulkResult);

      // When
      await purgeES.recursiveDelete(params);

      // Then
      expect(getBulkMock).toHaveBeenCalledTimes(1);
      expect(getBulkMock).toHaveBeenCalledWith(params);
      expect(configMock.getElasticMainIndex).toHaveBeenCalledTimes(1);

      expect(createBulkDeleteQueryMock).toHaveBeenCalledTimes(1);
      expect(createBulkDeleteQueryMock).toHaveBeenCalledWith(
        getBulkResult.ids,
        index
      );
      expect(sendBulkQueryMock).toHaveBeenCalledTimes(0);

      expect(handleProgressMock).toHaveBeenCalledTimes(1);
      expect(handleProgressMock).toHaveBeenCalledWith(params, getBulkResult);
    });
  });

  describe('run()', () => {
    let recursiveDeleteMock;
    beforeEach(() => {
      recursiveDeleteMock = jest.spyOn(purgeES, 'recursiveDelete');
      recursiveDeleteMock.mockResolvedValueOnce();
    });
    it('should run the program based on date', async () => {
      // Given
      const params = {
        counter: 0,
        from: 0,
        size: 500,
        total: null,
        wait: 1000,
      };

      // When
      await purgeES.run();

      // Then
      expect(recursiveDeleteMock).toHaveBeenCalledTimes(1);
      expect(recursiveDeleteMock).toHaveBeenCalledWith(params);
    });
  });
});
