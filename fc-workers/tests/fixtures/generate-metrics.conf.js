module.exports = {
  // Size of chunks sent to elastic
  CHUNK_SIZE: 400,
  // values for the keys property
  KEYS: ['account', 'activeAccount', 'desactivated'],
  // Values for the range property
  RANGES: ['day', 'week', 'month', 'year'],
  // Min values per range
  DEFAULT_AMOUNT_MIN: {
    day: 20,
    week: 140,
    month: 600,
    year: 7200,
  },
  // Max values per range
  DEFAULT_AMOUNT_MAX: {
    day: 40,
    week: 280,
    month: 1200,
    year: 15000,
  },
};
