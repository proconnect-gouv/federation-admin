const tasks = arr => arr.join(' && ');

module.exports = {
  hooks: {
    'pre-commit':
      'yarn lint:commit',
  },
};
