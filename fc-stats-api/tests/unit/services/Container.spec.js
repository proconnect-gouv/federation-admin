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
    it('Should reference given object', () => {
      // Given
      const service = { a: 'a' };
      const container = new Container();
      // When
      container.add('myService', service);
      // Then
      expect(container.services.myService).toBeDefined();
      expect(container.services.myService).toBe(service);
    });
    it('Should throw if service name is already used', () => {
      // Given
      const service = { a: 'a' };
      const container = new Container();
      // When
      container.add('myService', service);
      // Then
      expect(() => {
        container.add('myService', service);
      }).toThrow();
    });
    it('Should return the container', () => {
      // Given
      const service = { a: 'a' };
      const container = new Container();
      // When
      const result = container.add('myService', service);
      // Then
      expect(result).toBe(container);
    });
  });

  describe('get', () => {
    it('Should return a registered service', () => {
      // Given
      const service = { a: 'a' };
      const container = new Container();
      // When
      container.add('myService', service);
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
  });

  describe('remove', () => {
    it('Should remove registred service from container', () => {
      // Given
      const service = { a: 'a' };
      const container = new Container();
      // When
      container.add('myService', service);
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
      const container = new Container();
      // When
      container.add('myService', service);
      const result = container.remove('myService');
      // Then
      expect(result).toBe(container);
    });
  });
});
