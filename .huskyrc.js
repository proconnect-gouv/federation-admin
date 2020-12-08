const tasks = arr => arr.join(' && ');

module.exports = {
  hooks: {
    'pre-commit':
      "docker exec fc_fc-stats_1 bash -c 'cd /var/www/app && yarn lint:commit'",
  },
};
