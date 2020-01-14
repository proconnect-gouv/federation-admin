import Container from '../../../../src/services/Container';
import Stats from '../../../../src/services/Stats/Stats';

describe('Stats', () => {
  let statsService;
  let container;

  beforeEach(() => {
    container = new Container();
    statsService = new Stats(container);
  });

  describe('createMetricDocument', () => {
    it('Should return a metric document', () => {
      // Given
      const key = 'foo';
      const value = 'bar';
      const date = '2018-09-01';
      container.add('input', () => ({ get: (_schema, entry) => entry }));

      // When
      const result = statsService.createMetricDocument({ key, value, date });
      // Then
      expect(result).toEqual({
        key,
        value,
        date: new Date(date).toISOString(),
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
      const list = [{ id: 'a', b: 'b' }, { id: 'b', c: 'c' }];
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
      const api = { bulk: jest.fn() };
      container.add('dataApi', () => api);
      // When
      statsService.executeBulkQuery(query);
      // Then
      expect(api.bulk).toHaveBeenCalled();
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
});
