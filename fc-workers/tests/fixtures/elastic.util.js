const axios = require('axios');
const elasticsearch = require('elasticsearch');

const DEFAULT_PORT = 9200;
const LIST_HOSTS = [
  {
    host: 'haproxy_es',
    protocol: 'http',
    port: DEFAULT_PORT,
  },
  {
    host: 'fc_haproxy_es_1',
    protocol: 'http',
    port: DEFAULT_PORT,
  },
  {
    host: 'localhost',
    protocol: 'http',
    port: DEFAULT_PORT,
  },
];

/**
 * function used to find the good elasticsearch host from different context
 * ex: docker, local stack, or CI
 */
async function reachHost() {
  // Test all hosts possible
  const findOneHosts = LIST_HOSTS.map(async client => {
    const url =
      typeof client === 'string'
        ? client
        : `${client.protocol}://${client.host}:${client.port}`;
    try {
      await axios.options(url);
      return client;
    } catch (e) {
      return null;
    }
  });

  // grab the first host available
  const selectedHost = (await Promise.all(findOneHosts))
    .filter(f => f)
    .map(url => ({ host: url }))
    .pop();

  if (!selectedHost) {
    const hosts = LIST_HOSTS.map(h => JSON.stringify(h)).join(', ');
    throw new Error(
      `no available host has been found in [${hosts}], please check the config file`
    );
  }
  return selectedHost;
}

export default async function getClient() {
  const host = await reachHost();
  const ESClient = new elasticsearch.Client(host);
  return ESClient;
}
