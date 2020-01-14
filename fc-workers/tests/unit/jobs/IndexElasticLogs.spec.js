import IndexElasticLogs from '../../../src/jobs/IndexElasticLogs';
import Container from '../../../src/services/Container';

describe('IndexElasticLogs', () => {
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
        'dad31bb411c060d88954eeb8392d767181f5a12782de8736934e66f47e0c37a5'
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
        '5071cafb69a4c6cf5f8632dd87a6eddac3cf1e72b69a08552af4a4b902517118'
      );
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
        { items: new Array(2) },
        { items: new Array(2) },
        { items: new Array(2) },
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
    it('Should call executeQuery as many time as there are chunks', async () => {
      // Given
      const stats = {
        executeBulkQuery: jest.fn(),
        createBulkQuery: jest.fn(),
      };
      const container = new Container();
      container.add('logger', () => ({}));
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
      container.add('stats', () => stats);
      await job.createDocuments(docList, chunkLength, delay);
      // Then
      expect(stats.createBulkQuery).toHaveBeenCalledTimes(2);
      expect(stats.executeBulkQuery).toHaveBeenCalledTimes(2);
    });
  });
});
