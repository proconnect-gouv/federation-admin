import IndexElasticLogs from '../../../src/jobs/IndexElasticLogs';
import Container from '../../../src/services/Container';

const { bucketSample, dataSample, nofsDataSample } = require('./fixtures');

describe('IndexElasticLogs', () => {
  describe('hasChildren', () => {
    it('Should return false if not buckets property', () => {
      // Given
      const property = {
        foo: 'bar',
      };
      // When
      const result = IndexElasticLogs.hasChildren(property);
      // Then
      expect(result).toBe(false);
    });

    it('Should return false if undefined passed', () => {
      // Given
      const input = {};
      // When
      const result = IndexElasticLogs.hasChildren(input.property);
      // Then
      expect(result).toBe(false);
    });

    it('Should return false if buckets is not an array', () => {
      // Given
      const property = {
        buckets: 'bar',
      }; // When
      const result = IndexElasticLogs.hasChildren(property);
      // Then
      expect(result).toBe(false);
    });

    it('Should return true if buckets is an array', () => {
      // Given
      const property = {
        buckets: [],
      }; // When
      const result = IndexElasticLogs.hasChildren(property);
      // Then
      expect(result).toBe(true);
    });
  });

  describe('getChildren', () => {
    it('Should return an object with key and items', () => {
      // Given
      const input = {
        key: 'foo',
        bar: true,
        buzz: {
          buckets: [1, 2],
        },
        baz: [],
        fizz: {
          buckets: [3, 4],
        },
        zam: {
          buckets: {},
        },
      };
      // When
      const result = IndexElasticLogs.getChildren(input);
      // Then
      expect(result).toEqual([
        { key: 'buzz', children: [1, 2] },
        { key: 'fizz', children: [3, 4] },
      ]);
    });
  });

  describe('computeResult', () => {
    it('Should return an object', () => {
      // Given
      const input = { action: 'foo' };
      const key = 'fi';
      const node = { key: 'bar', doc_count: 23 };
      // When
      const results = IndexElasticLogs.computeResult(input, key, node);
      // Then
      expect(typeof results).toBe('object');
      expect(Array.isArray(results)).toBe(false);
      expect(results).toEqual({
        action: 'foo',
        fi: 'bar',
        count: 23,
      });
    });

    it('Should return an object with appropriate properties', () => {
      // Given
      const input = {
        action: 'initial',
        fs: 'fsp1.dev.dev-franceconnect.fr',
      };
      const key = 'fi';
      // initial > fi > fs
      const node = JSON.parse(bucketSample).fs.buckets[0].fi.buckets[0];
      // When
      const result = IndexElasticLogs.computeResult(input, key, node);
      // Then
      expect(result).toEqual({
        action: 'initial',
        fi: 'dgfip',
        fs: 'fsp1.dev.dev-franceconnect.fr',
        count: 56,
      });
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

  describe('removeId', () => {
    it('Should return object without id property', () => {
      // Given
      const input = {
        foo: 'foo',
        id: 'id',
      };
      // When
      const result = IndexElasticLogs.removeId(input);
      // Then
      expect(result).toEqual({ foo: 'foo' });
    });
    it('Should not mutate input', () => {
      // Given
      const input = {
        foo: 'foo',
        id: 'id',
      };
      // When
      IndexElasticLogs.removeId(input);
      // Then
      expect(input).toEqual({ foo: 'foo', id: 'id' });
    });
  });

  describe('addNAFI', () => {
    it('Should add a fi prop with "N/A" as value if no prop present', () => {
      // Given
      const input = { foo: 'foo' };
      // When
      const result = IndexElasticLogs.addNAFI(input);
      // Then
      expect(result.fi).toBe('N/A');
    });
    it('Should not override existing fi prop', () => {
      // Given
      const input = { foo: 'foo', fi: 'fi' };
      // When
      const result = IndexElasticLogs.addNAFI(input);
      // Then
      expect(result.fi).toBe('fi');
    });
  });

  describe('mapToArrayWithIds', () => {
    it('Should return an array of object', () => {
      // Given
      const map = {
        foo: { a: 'b' },
        bar: { c: 'd' },
      };
      // When
      const result = IndexElasticLogs.mapToArrayWithIds(map);
      // Then
      expect(result).toEqual([{ id: 'foo', a: 'b' }, { id: 'bar', c: 'd' }]);
    });
  });

  describe('getDocuments', () => {
    it('Should return a simplified data structure', () => {
      // Given
      const input = JSON.parse(dataSample);
      // When
      const result = IndexElasticLogs.getDocuments(input);
      // Then
      expect(result).toEqual({
        '57986b4f43bd5d8602b805d2a003112439ac22ca77c5d47dcf19a2635fc3186d': {
          date: 1459123200000,
          count: 56,
          action: 'authentication',
          typeAction: 'initial',
          fs: 'fsp1.dev.dev-franceconnect.fr',
          fi: 'dgfip',
        },
        '3d7627fc1b186ecd4e5e2425ad9275e45b5d11ae4864ddb6fd66991a07534be4': {
          date: 1459123200000,
          count: 7,
          action: 'authentication',
          typeAction: 'initial',
          fs: 'fsp1.dev.dev-franceconnect.fr',
          fi: 'ameli',
        },
        f597e090be2d3322605fa4719bc2581b228746650ce0a7b0f8adddb400b8e296: {
          date: 1459123200000,
          count: 16,
          action: 'authentication',
          typeAction: 'initial',
          fs: 'fsp2.dev.dev-franceconnect.fr',
        },
        '8ae30c2c49b499b4132e798de44ae812426e423028dda5219b8cfcd7b4c713e3': {
          date: 1459123200000,
          count: 5,
          action: 'authentication',
          typeAction: 'initial',
          fs: 'fsp3.dev.dev-franceconnect.fr',
          fi: 'dgfip',
        },
        '1e6e4b1ab3d4c0501a10d59a75ec8593d1093507eb3c0ab66917dc2424cf2ffb': {
          date: 1459123200000,
          count: 5,
          action: 'authentication',
          typeAction: 'initial',
          fs: 'fsp4.dev.dev-franceconnect.fr',
          fi: 'dgfip',
        },
      });
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

  describe('moveNofsToFs', () => {
    it('Should move nofs to fs bucket', () => {
      // Given
      const input = {
        nofs: {
          doc_count: 1,
          fi: 'fi',
        },
        fs: {
          buckets: [{ fizz: 'fizz' }],
        },
      };
      // When
      const result = IndexElasticLogs.moveNofsToFs(input);
      // Then
      expect(typeof result).toBe('object');
      expect(result.fs.buckets).toHaveLength(2);
      expect(result).toEqual({
        fs: {
          buckets: [{ fizz: 'fizz' }, { doc_count: 1, key: 'N/A', fi: 'fi' }],
        },
      });
    });
  });

  describe('fixMissingFields', () => {
    it('Should return an object', () => {
      // Given
      const input = JSON.parse(nofsDataSample);
      // When
      const result = IndexElasticLogs.fixMissingFields(input);
      // Then
      expect(typeof result).toBe('object');
    });
    it('Should remove the "nofs" key', () => {
      // Given
      const input = JSON.parse(nofsDataSample);
      // When
      const result = IndexElasticLogs.fixMissingFields(input);
      const nofsProp = result.date.buckets[0].action.buckets[0].nofs;
      // Then
      expect(typeof nofsProp).toBe('undefined');
    });
    it('Should create a "N/A" fs with "nofs" value', () => {
      // Given
      const input = JSON.parse(nofsDataSample);
      // When
      const result = IndexElasticLogs.fixMissingFields(input);
      const fsbucket =
        result.date.buckets[0].action.buckets[0].typeAction.buckets[0].fs
          .buckets;
      // Then
      expect(fsbucket).toEqual([
        {
          key: 'N/A',
          doc_count: 2,
          fi: {
            buckets: [
              {
                key: 'dgfip',
                doc_count: 2,
              },
            ],
          },
        },
      ]);
    });

    it('Should note mutate input', () => {
      // Given
      const input = JSON.parse(nofsDataSample);
      const copy = JSON.parse(nofsDataSample);
      // When
      IndexElasticLogs.fixMissingFields(input);
      // Then
      expect(input).toEqual(copy);
    });
  });

  describe('createDocuments', () => {
    it('Should call executeQuery as many time as there are chunks', () => {
      // Given
      const stats = {
        executeBulkQuery: jest.fn(),
        createBulkQuery: jest.fn(),
      };
      const container = new Container();
      const docList = [
        { id: 'a', a: 1 },
        { id: 'b', c: 2 },
        { id: 'c', c: 3 },
        { id: 'd', c: 4 },
      ];
      const chunkLength = 2;
      const job = new IndexElasticLogs(container);
      // When
      container.add('stats', () => stats);
      job.createDocuments(docList, chunkLength);
      // Then
      expect(stats.createBulkQuery).toHaveBeenCalledTimes(2);
      expect(stats.executeBulkQuery).toHaveBeenCalledTimes(2);
    });
  });
});
