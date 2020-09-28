import * as moment from 'moment-timezone';
import { toDate } from './string.transform';

describe('toDate', () => {
  const format = 'YYYY-MM-DD';
  const wrongFormat = 'YYY-MM-D';
  const date = '2020-09-10';

  it('should return a function', () => {
    // When
    const valid = toDate(format);

    // Then
    expect(valid).toBeInstanceOf(Function);
  });

  it('should return a function that return a Date', () => {
    // When
    const valid = toDate(format);

    // Then
    expect(valid(date)).toBeInstanceOf(Date);
  });

  it('should return a function that return a Date with the right format: YYYY-MM-DD', () => {
    // Given
    const myFunc = toDate(format);
    const expected = moment(date, format).toDate();

    // When
    const valid = myFunc(date);

    // Then
    expect(valid).toEqual(expected);
  });

  it('should return undefined if the date format is not YYYY-MM-DD', () => {
    // Given
    const myFunc = toDate(wrongFormat);

    // When
    const valid = myFunc(date);

    // Then
    expect(valid).toEqual(undefined);
  });
});
