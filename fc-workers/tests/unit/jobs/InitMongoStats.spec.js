import InitMongoStats from '../../../src/jobs/InitMongoStats';

const daysMock = [
  { date: '2020-12-15', value: 2 },
  { date: '2020-12-16', value: 3 },
  { date: '2020-12-17', value: 4 },
  { date: '2020-12-18', value: 2 },
  { date: '2020-12-19', value: 3 },
  { date: '2020-12-20', value: 4 },
  { date: '2020-12-21', value: 2 }, // W
  { date: '2020-12-22', value: 3 },
  { date: '2020-12-23', value: 4 },
  { date: '2020-12-24', value: 2 },
  { date: '2020-12-25', value: 3 },
  { date: '2020-12-26', value: 4 },
  { date: '2020-12-27', value: 2 },
  { date: '2020-12-28', value: 3 }, // W
  { date: '2020-12-29', value: 4 },
  { date: '2020-12-30', value: 2 },
  { date: '2020-12-31', value: 3 },
  { date: '2021-01-01', value: 4 }, // M  Y
  { date: '2021-01-02', value: 2 },
  { date: '2021-01-03', value: 3 },
  { date: '2021-01-04', value: 4 }, // W
  { date: '2021-01-05', value: 2 },
  { date: '2021-01-06', value: 3 },
  { date: '2021-01-07', value: 4 },
  { date: '2021-01-08', value: 2 },
  { date: '2021-01-09', value: 3 },
  { date: '2021-01-10', value: 4 },
];

describe('InitMongoStats', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('periodReducer', () => {
    it('should return a function that...', () => {
      // Given
      const period = 'isoWeek';
      // When
      const result = InitMongoStats.periodReducer(period);
      // Then
      expect(typeof result).toBe('function');
    });
    it('should return an object when used as reducer', () => {
      // Given
      const period = 'isoWeek';
      // When
      const result = daysMock.reduce(InitMongoStats.periodReducer(period), {});
      // Then
      expect(typeof result).toBe('object');
    });
    it('should contain keys for each first day of weeks', () => {
      // Given
      const period = 'isoWeek';
      // When
      const result = daysMock.reduce(InitMongoStats.periodReducer(period), {});
      // Then
      expect(Object.keys(result)).toEqual([
        '2020-12-14',
        '2020-12-21',
        '2020-12-28',
        '2021-01-04',
      ]);
    });
  });

  describe('daysToPeriod', () => {
    it('should call periodReducer', () => {
      // Given
      const periodReducerSpy = jest.spyOn(InitMongoStats, 'periodReducer');
      const period = 'week';
      // When
      InitMongoStats.daysToPeriod(daysMock, period);
      // Then
      expect(periodReducerSpy).toHaveBeenCalledTimes(1);
      expect(periodReducerSpy).toHaveBeenCalledWith(period);
    });
  });

  describe('daysToWeeks', () => {
    it('should call InitMongoStats.daysToPeriod ', () => {
      // Given
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      // When
      InitMongoStats.daysToWeeks(daysMock);
      // Then
      expect(InitMongoStatsSpy).toHaveBeenCalledTimes(1);
      expect(InitMongoStatsSpy).toHaveBeenCalledWith(daysMock, 'isoWeek');
    });

    it('should return result from InitMongoStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      InitMongoStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = InitMongoStats.daysToWeeks(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return week aggregation', () => {
      // When
      const result = InitMongoStats.daysToWeeks(daysMock);
      // Then
      expect(result).toEqual([
        { date: '2020-12-14', value: 18 },
        { date: '2020-12-21', value: 20 },
        { date: '2020-12-28', value: 21 },
        { date: '2021-01-04', value: 22 },
      ]);
    });
  });

  describe('daysToMonths', () => {
    it('should call InitMongoStats.daysToPeriod ', () => {
      // Given
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      // When
      InitMongoStats.daysToMonths(daysMock);
      // Then
      expect(InitMongoStatsSpy).toHaveBeenCalledTimes(1);
      expect(InitMongoStatsSpy).toHaveBeenCalledWith(daysMock, 'month');
    });

    it('should return result from InitMongoStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      InitMongoStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = InitMongoStats.daysToMonths(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return month aggregation', () => {
      // When
      const result = InitMongoStats.daysToMonths(daysMock);
      // Then
      expect(result).toEqual([
        { date: '2020-12-01', value: 50 },
        { date: '2021-01-01', value: 31 },
      ]);
    });
  });

  describe('daysToYears', () => {
    it('should call InitMongoStats.daysToPeriod ', () => {
      // Given
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      // When
      InitMongoStats.daysToYears(daysMock);
      // Then
      expect(InitMongoStatsSpy).toHaveBeenCalledTimes(1);
      expect(InitMongoStatsSpy).toHaveBeenCalledWith(daysMock, 'year');
    });

    it('should return result from InitMongoStats.daysToPeriod ', () => {
      // Given
      const mockReturnValue = Symbol('daysToPeriod return value');
      const InitMongoStatsSpy = jest.spyOn(InitMongoStats, 'daysToPeriod');
      InitMongoStatsSpy.mockReturnValue(mockReturnValue);
      // When
      const result = InitMongoStats.daysToYears(daysMock);
      // Then
      expect(result).toBe(mockReturnValue);
    });

    // Integration test
    it('should return year aggregation', () => {
      // When
      const result = InitMongoStats.daysToYears(daysMock);
      // Then
      expect(result).toEqual([
        { date: '2020-01-01', value: 50 },
        { date: '2021-01-01', value: 31 },
      ]);
    });
  });

  describe('resultToDoc', () => {
    it('should transform input to elastic doc', () => {
      // Given
      const input = [
        { date: '2021-01-21', value: 42 },
        { date: '2021-01-22', value: 1337 },
      ];
      const key = 'registration';
      const range = 'day';
      // When
      const result = InitMongoStats.resultToDoc(input, key, range);
      // Then
      expect(result).toEqual([
        {
          key: 'registration',
          date: '2021-01-21',
          value: 42,
          range: 'day',
        },
        {
          key: 'registration',
          date: '2021-01-22',
          value: 1337,
          range: 'day',
        },
      ]);
    });
  });
});
