import { DateTime } from 'luxon';
import { getDaysAsIso, getDaysAsDate } from '../../../../src/utils';

describe('getDaysAsIso()', () => {
  it('should get list of date based on interval', () => {
    // Given
    const start = DateTime.fromISO('2019-01-01', { zone: 'utc' });
    const stop = DateTime.fromISO('2019-01-07', { zone: 'utc' });

    const resultMock = [
      '2019-01-01T00:00:00.000Z',
      '2019-01-02T00:00:00.000Z',
      '2019-01-03T00:00:00.000Z',
      '2019-01-04T00:00:00.000Z',
      '2019-01-05T00:00:00.000Z',
      '2019-01-06T00:00:00.000Z',
      '2019-01-07T00:00:00.000Z',
    ];

    // When
    const dates = getDaysAsIso(start, stop);

    // Then
    expect(dates).toStrictEqual(resultMock);
  });
});

describe('getDaysAsDate()', () => {
  it('should get list of date based on interval', () => {
    // Given
    const start = DateTime.fromISO('2019-01-01', { zone: 'utc' });
    const stop = DateTime.fromISO('2019-01-07', { zone: 'utc' });

    const resultMock = [
      '2019-01-01',
      '2019-01-02',
      '2019-01-03',
      '2019-01-04',
      '2019-01-05',
      '2019-01-06',
      '2019-01-07',
    ];

    // When
    const dates = getDaysAsDate(start, stop);

    // Then
    expect(dates).toStrictEqual(resultMock);
  });
});
