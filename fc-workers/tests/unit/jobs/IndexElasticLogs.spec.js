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
