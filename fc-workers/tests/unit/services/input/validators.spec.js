import {
  string,
  number,
  action,
  date,
} from '../../../../src/services/Input/validators';

describe('services/input/validators', () => {
  describe('string', () => {
    it('Should return true if input is a string', () => {
      // Given
      const input = 'foo';
      // When
      const result = string(input);
      // Then
      expect(result).toBe(true);
    });
    it('Should return false if input is not a string', () => {
      // Given
      const input = 42;
      // When
      const result = string(input);
      // Then
      expect(result).toBe(false);
    });
  });
  describe('number', () => {
    it('Should return true if input is a number', () => {
      // Given
      const input = 42;
      // When
      const result = number(input);
      // Then
      expect(result).toBe(true);
    });
    it('Should return false if input is not a number', () => {
      // Given
      const input = 'a string';
      // When
      const result = number(input);
      // Then
      expect(result).toBe(false);
    });
  });
  describe('action', () => {
    it('Should return true if input is a action', () => {
      // Given
      const input = 'newauthenticationquery';
      // When
      const result = action(input);
      // Then
      expect(result).toBe(true);
    });
    it('Should return false if input is not a action', () => {
      // Given
      const input = 'a string';
      // When
      const result = action(input);
      // Then
      expect(result).toBe(false);
    });
  });
  describe('date', () => {
    it('Should return true if input is parsable as a date', () => {
      // Given
      const input = '2018-01-02';
      // When
      const result = date(input);
      // Then
      expect(result).toBe(true);
    });

    it('Should return true if input is another parsable date', () => {
      // Given
      const input = '2018/08/13';
      // When
      const result = date(input);
      // Then
      expect(result).toBe(true);
    });

    it('Should return false if input is an emty string', () => {
      // Given
      const input = '';
      // When
      const result = date(input);
      // Then
      expect(result).toBe(false);
    });

    it('Should return false if input is not a date', () => {
      // Given
      const input = 'a string';
      // When
      const result = date(input);
      // Then
      expect(result).toBe(false);
    });
  });
});
