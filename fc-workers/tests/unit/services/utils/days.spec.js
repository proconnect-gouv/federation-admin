import { DateTime } from 'luxon';
import { getDayArray } from '../../../../src/utils';

describe('getDayArray()', () => {
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
    ];

    // When
    const dates = getDayArray(start, stop);

    // Then
    expect(dates).toStrictEqual(resultMock);
  });
});
