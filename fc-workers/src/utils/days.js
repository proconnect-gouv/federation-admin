import { Interval } from 'luxon';

export function getDaysAsIso(start, end) {
  // Interval is not inclusive with "end"
  const stop = end.plus({ days: 1 });
  const interval = Interval.fromDateTimes(start, stop);
  const steps = interval.splitBy({ days: 1 });
  const dates = steps.map(({ start: s }) => s.toISO());
  return dates;
}

export function getDaysAsDate(start, end) {
  // Interval is not inclusive with "end"
  const stop = end.plus({ days: 1 });
  const interval = Interval.fromDateTimes(start, stop);
  const steps = interval.splitBy({ days: 1 });
  const dates = steps.map(({ start: s }) => s.toISODate());
  return dates;
}
