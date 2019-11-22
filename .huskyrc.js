const tasks = arr => arr.join(' && ');

module.exports = {
  hooks: {
    'pre-commit':
      "docker exec fc_stats_1 bash -c 'cd /var/www/app && yarn lint'",
    'pre-push': tasks([
      'cd $FC_ROOT/fc-apps/fc-exploitation && npx cypress run',
      'cd $FC_ROOT/fc-apps/fc-stats && npx cypress run',
      'cd $FC_ROOT/fc-apps/fc-support && npx cypress run',
    ]),
  },
};
