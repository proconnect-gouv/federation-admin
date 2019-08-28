import { FilterParamDTO } from './filter-param.dto';

describe('FilterParamDTO', () => {
  describe('parse', () => {
    it('Should return an instance of FilterParamDTO', () => {
      // Given
      const input = 'foo:bar';
      // When
      const result = FilterParamDTO.parse(input);
      // Then
      expect(result instanceof FilterParamDTO).toBeTruthy();
    });
    it('Should return an instance with assigned properties', () => {
      // Given
      const input = 'foo:bar';
      // When
      const result = FilterParamDTO.parse(input);
      // Then
      expect(result instanceof FilterParamDTO).toBeTruthy();
      expect(result.key).toBe('foo');
      expect(result.value).toBe('bar');
    });
  });
});
