import { getRandomInt } from '../../../../src/utils';

describe('getRandomInt()', () => {
  it('should get integer random number', () => {
    // Given
    // When
    const result = getRandomInt(10, 0);

    // Then
    expect(typeof result).toBe('number');
    expect(result).toBe(Math.floor(result));
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should get integer random number with defaut min value', () => {
    // Given
    // When
    const result = getRandomInt(10);

    // Then
    expect(typeof result).toBe('number');
    expect(result).toBe(Math.floor(result));
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
