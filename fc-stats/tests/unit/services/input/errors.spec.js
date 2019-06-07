import {
  MissingInputError,
  InvalidInputError,
} from '../../../../src/services/Input/errors';

describe('services/input/errors', () => {
  describe('MissingInputError', () => {
    it('Should have stack property', () => {
      // Given
      const missings = ['foo', 'bar'];
      // When
      const error = new MissingInputError(missings, 'a message');
      // Then
      expect(error.stack).toBe(missings);
    });
  });

  describe('InvalidInputError', () => {
    it('Should have invalids property', () => {
      // Given
      const invalids = ['foo', 'bar'];
      // When
      const error = new InvalidInputError(invalids, 'a message');
      // Then
      expect(error.stack).toBe(invalids);
    });
  });
});
