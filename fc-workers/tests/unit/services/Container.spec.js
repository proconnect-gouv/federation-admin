import Container from '../../../src/services/Container';

describe('services/containers', () => {
  describe('constuctor', () => {
    it('Should have an empty services property', () => {
      // Given
      const container = new Container();
      // Then
      expect(typeof container.services).toBe('object');
      expect(Object.keys(container.services)).toHaveLength(0);
    });
  });

  describe('add', () => {
    it('Should reference instanciation function', () => {
      // Given
      const service = () => 'foo';
      const container = new Container();
      // When
      container.add('myService', service);
      // Then
      expect(container.get('myService')).toBe('foo');
    });

    it('Should not instanciate at register time', () => {
      // Given
      const spy = jest.fn();
      const service = () => {
        spy();
        return 'foo';
      };
      const container = new Container();
      // When
      container.add('myService', service);
      // Then
      expect(spy).not.toHaveBeenCalled();
    });

    it('Should instanciate at get time', () => {
      // Given
      const spy = jest.fn();
      const service = () => {
        spy();
        return 'foo';
      };
      const container = new Container();
      // When
      container.add('myService', service);
      const result = container.get('myService');
      // Then
      expect(spy).toHaveBeenCalled();
      expect(result).toBe('foo');
    });

    it('Should instanciate only one time', () => {
      // Given
      const spy = jest.fn();
      const service = () => {
        spy();
        return Symbol('foo');
      };
      const container = new Container();
      // When
      container.add('myService', service);
      const result1 = container.get('myService');
      const result2 = container.get('myService');
      // Then
      expect(spy).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });
  });

  describe('get', () => {
    it('Should return a registered service', () => {
      // Given
      const service = { a: 'a' };
      const instanciator = () => service;
      const container = new Container();
      // When
      container.add('myService', instanciator);
      const result = container.get('myService');
      // Then
      expect(result).toBe(service);
    });
    it('Should throw if service is not registred', () => {
      // Given
      const container = new Container();
      // Then
      expect(() => {
        container.get('myService');
      }).toThrow();
    });
    it('Should return multiple services if an array is given', () => {
      // Given
      const fooService = Symbol('foo');
      const barService = Symbol('bar');
      const bazService = Symbol('baz');
      const container = new Container();
      // When
      container.add('foo', () => fooService);
      container.add('bar', () => barService);
      container.add('baz', () => bazService);

      const { foo, bar, baz } = container.get(['foo', 'bar', 'baz']);
      // Then
      expect(foo).toBe(fooService);
      expect(bar).toBe(barService);
      expect(baz).toBe(bazService);
    });
  });

  describe('remove', () => {
    it('Should remove registred service from container', () => {
      // Given
      const service = { a: 'a' };
      const instanciator = () => service;
      const container = new Container();
      // When
      container.add('myService', instanciator);
      container.get('myService');
      container.remove('myService');
      // Then
      expect(() => {
        container.get('myService');
      }).toThrow();
    });
    it('Should throw if attemping to remove non registred service', () => {
      // Given
      const container = new Container();
      // Then
      expect(() => {
        container.remove('myService');
      }).toThrow();
    });
    it('Should return the container', () => {
      // Given
      const service = { a: 'a' };
      const instanciator = () => service;
      const container = new Container();
      // When
      container.add('myService', instanciator);
      container.get('myService');
      const result = container.remove('myService');
      // Then
      expect(result).toBe(container);
    });
  });
});
