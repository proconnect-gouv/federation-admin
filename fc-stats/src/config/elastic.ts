export default {
  hosts: process.env.ES_STATS_HOSTS
    ? process.env.ES_STATS_HOSTS.split(',')
    : ['localhost:9200'],
  // log: process.env.ELASTIC_LOG || 'trace',
};
