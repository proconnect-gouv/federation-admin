import { Interval } from 'luxon';

export default function getDayArray(start, end) {
  const interval = Interval.fromDateTimes(start, end);
  const steps = interval.splitBy({ days: 1 });
  const dates = steps.map(({ start: s }) => s.toISO());
  return dates;
}
