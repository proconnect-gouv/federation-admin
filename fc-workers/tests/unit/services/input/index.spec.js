import {
  MissingInputError,
  MissingValidatorError,
  InvalidInputError,
} from '../../../../src/services/Input/errors';

import Input from '../../../../src/services/Input';

describe('services/Input', () => {
  describe('Input.get', () => {
    it('Should throw an error if one mandatory input is missing', () => {
      // Given
      const schema = {
        foo: { type: 'string', mandatory: true },
        bar: { type: 'number' },
      };
      const input = { bar: 42 };
      // Then
      expect(() => {
        Input.get(schema, input);
      }).toThrowError(
        new MissingInputError(['foo'], 'Missing mandatory inputs')
      );
    });
    it('Should throw with list of missings if one mandatory input is missing', () => {
      // Given
      const schema = {
        foo: { type: 'string', mandatory: true },
        bar: { type: 'number' },
      };
      const input = { bar: 42 };

      try {
        // When
        Input.get(schema, input);
      } catch (error) {
        // Then
        expect(Array.isArray(error.stack)).toBe(true);
        expect(error.stack).toEqual(['foo']);
      }
    });
    it('Should return input according to schema if everything is ok', () => {
      // Given
      const schema = {
        foo: { type: 'string', mandatory: true },
        bar: { type: 'number' },
      };
      const input = { bar: 42, foo: 'foo' };
      // When
      const result = Input.get(schema, input);
      // Then
      expect(result).toEqual({
        foo: 'foo',
        bar: 42,
      });
    });
    it('Should not return input not part of schema', () => {
      // Given
      const schema = {
        foo: { type: 'string', mandatory: true },
        bar: { type: 'number' },
      };
      const input = { bar: 42, foo: 'foo', wiz: 'wiz' };
      // When
      const result = Input.get(schema, input);
      // Then
      expect(result).toEqual({
        foo: 'foo',
        bar: 42,
      });
    });
    it('Should throw if input fails type validation', () => {
      // Given
      const schema = {
        foo: { type: 'string', mandatory: true },
        bar: { type: 'number' },
      };
      const input = { foo: 45, bar: 42 };
      // Then
      expect(() => {
        Input.get(schema, input);
      }).toThrowError(InvalidInputError);
    });
    it('Should throw with list of invalids if input fails validation', () => {
      // Given
      const schema = {
        foo: { type: 'number' },
        bar: { type: 'string' },
      };
      const input = { foo: 'a string', bar: 'a string' };

      try {
        // When
        Input.get(schema, input);
      } catch (error) {
        // Then
        expect(Array.isArray(error.stack)).toBe(true);
        expect(error.stack).toEqual(['foo']);
      }
    });
  });

  describe('getMissingMandatory', () => {
    it('Should return an array with missing mandatories', () => {
      // Given
      const schema = {
        foo: { type: 'string', mandatory: true },
        bar: { type: 'number' },
        wiz: { type: 'string', mandatory: true },
      };
      const input = { bar: 42 };
      // When
      const result = Input.getMissingMandatories(schema, input);
      // Then
      expect(result).toHaveLength(2);
      expect(result).toEqual(['foo', 'wiz']);
    });
  });

  it('Should return an empty array', () => {
    // Given
    const schema = {
      foo: { type: 'string', mandatory: true },
      bar: { type: 'number' },
      wiz: { type: 'string', mandatory: true },
    };
    const input = { bar: 42, foo: 'foo', wiz: 'wiz' };
    // When
    const result = Input.getMissingMandatories(schema, input);
    // Then
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  describe('getSchemaValues', () => {
    it('Should return only key present in schema', () => {
      // Given
      const schema = {
        foo: 'foo',
        bar: 'bar',
      };
      const input = { bar: 'bar', foo: 'foo', wiz: 'wiz' };
      // When
      const result = Input.getSchemaValues(schema, input);
      // Then
      expect(result).toEqual({ foo: 'foo', bar: 'bar' });
    });
  });

  describe('getInvalidInputs', () => {
    it('Should throw if validator is not defined', () => {
      // Given
      const schema = {
        foo: { type: 'not_a_validator' },
        bar: { type: 'number' },
      };
      const input = { foo: 'foo', bar: 'bar' };
      // Then
      expect(() => {
        Input.getInvalidInputs(schema, input);
      }).toThrowError(
        new MissingValidatorError(
          'Schema error: No validator defined for type <not_a_validator>'
        )
      );
    });
    it('Should allow without check fields with no type', () => {
      // Given
      const schema = {
        foo: { mandatory: true },
      };
      const input = { foo: 'foo' };
      // When
      const result = Input.getInvalidInputs(schema, input);
      // Then
      expect(result).toEqual([]);
    });
    it('Should return list of invalid inputs', () => {
      // Given
      const schema = {
        foo: { type: 'string' },
        bar: { type: 'number' },
      };
      const input = { foo: 'foo', bar: 'bar' };
      // When
      const result = Input.getInvalidInputs(schema, input);
      // Then
      expect(result).toEqual(['bar']);
    });
  });
});
