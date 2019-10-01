export const string = input => typeof input === 'string';

export const number = input => typeof input === 'number';

const allowedTimeRanges = ['day', 'week', 'month', 'year'];
export const timeRange = input => allowedTimeRanges.indexOf(input) > -1;

const allowedActions = ['newauthenticationquery', 'authentication'];
export const action = input => allowedActions.indexOf(input) > -1;

export const date = input => {
  return !Number.isNaN(Date.parse(input));
};
