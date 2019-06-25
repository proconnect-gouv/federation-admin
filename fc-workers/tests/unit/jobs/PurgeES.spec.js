import PurgeES from '../../../src/jobs/PurgeES';

describe('PurgeES', () => {
  describe('createBulkQuery', () => {
    it('Should return a bulk delete query', () => {
      // Given
      const input = [1, 2];
      // When
      const result = PurgeES.createBulkDeleteQuery(input);
      // Then
      expect(result).toEqual({
        body: [
          { delete: { _index: 'franceconnect', _type: 'log', _id: 1 } },
          { delete: { _index: 'franceconnect', _type: 'log', _id: 2 } },
        ],
      });
    });
  });

  describe('handleProgress', () => {
    it('Should log progress', () => {
      const container = { services: { logger: { info: jest.fn() } } };
      const purgeES = new PurgeES(container);
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
      expect(container.services.logger.info.mock.calls).toHaveLength(1);
      expect(container.services.logger.info.mock.calls[0][0]).toBe(
        `[40%] Sent delete for 2 docs. Remaining docs: 6 / 10`
      );
    });
    it('Should call recursiveDelete', done => {
      const container = { services: { logger: { info: jest.fn() } } };
      const purgeES = new PurgeES(container);
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
      const container = { services: { logger: { info: jest.fn() } } };
      const purgeES = new PurgeES(container);
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
});
