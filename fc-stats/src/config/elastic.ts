export default {
  hosts: process.env.ELASTIC_HOSTS
    ? JSON.parse(process.env.ELASTIC_HOSTS)
    : ['localhost:9200'],
  // log: process.env.ELASTIC_LOG || 'trace',
};
