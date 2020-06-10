const crypto = require('crypto');
const axios = require('axios');
const elasticsearch = require('elasticsearch');

const DEFAULT_PORT = 9200;
const LIST_HOSTS = [
  {
    host: 'elasticsearch',
    protocol: 'http',
    port: DEFAULT_PORT,
  },
  {
    host: 'fc_elasticsearch_1',
    protocol: 'http',
    port: DEFAULT_PORT,
  },
  {
    host: 'localhost',
    protocol: 'http',
    port: DEFAULT_PORT,
  },
];

let ESClient;
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
      `no available host was find in [${hosts}], please check the config file`
    );
  }
  return selectedHost;
}

const {
  CHUNK_SIZE,
  IDPS,
  SPS,
  CITY,
  ACTIONS,
  RNIPP_RESULT,
} = require('./generate-logs.conf');

let COUNTER = 0;

let ACCOUNTS = [];

function generateAccounts(count) {
  const nbToGen = Math.ceil(count / 10);

  // generate range between 0 and nbToGen in an Array
  const rangeOfAccounts = [...Array(nbToGen).keys()];
  return rangeOfAccounts.map(i =>
    crypto
      .createHash('sha256')
      .update(`${i}${new Date().toISOString()}`)
      .digest('hex')
  );
}

function pickOne(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

/**
 * Generic function to get random value in a range with any precision
 * @param {*} minValue min value
 * @param {*} maxValue max value
 * @param {*} precision number of digit after the comma
 */
function random(minValue, maxValue, precision = 2) {
  const min = Math.ceil(minValue * 10 ** precision);
  const max = Math.floor(maxValue * 10 ** precision);
  return (Math.floor(Math.random() * (max - min + 1)) + min) / 10 ** precision;
}

function randomTime(inputDate) {
  const hour = random(0, 23);
  const minute = random(0, 59);
  const second = random(0, 59);

  const date = new Date(inputDate.getTime());
  date.setUTCHours(hour);
  date.setUTCMinutes(minute);
  date.setUTCSeconds(second);

  return date;
}

function appendRnippStatus(entry) {
  return entry.action === 'rnippCheck'
    ? { ...entry, rnippReturnValue: pickOne(RNIPP_RESULT) }
    : entry;
}

function appendAccountId(entry) {
  return entry.type_action === 'initial'
    ? { ...entry, accountId: pickOne(ACCOUNTS) }
    : entry;
}

function randomID() {
  return random(1000, 9999, 0);
}

function randomIPS(nb = 3) {
  const num = () => random(0, 255, 0);
  const ip = () => `${num()}.${num()}.${num()}.${num()}`;
  return [...Array(Math.ceil(Math.random() * nb)).keys()]
    .map(() => ip())
    .join(', ');
}

/**
 * Generate false date from mapping of ElasticSearch
 * @see /Infra/ansible/roles/elasticsearch/files/create_index_business.json
 * don't add unknow field to document or insertion of doc will failed
 */
function generateDocument(day) {
  // Default template of data for a log in ES
  const basic = {
    v: 0,
    type: 'log',
    tags: ['beats_input_raw_event'],
    hostname: 'fcexpndjs03',
    offset: 1636102,
    name: 'FranceConnect',
    count: 1,
    msg: '',
    level: 30,
    '@version': '1',
    beat: {
      name: 'fcopras01',
      hostname: 'fcopras01',
    },
    geoloc_country_iso_code: 'FR',
    host: { name: 'prod-sanctuaire-01' },
  };

  const { action, type_action: type } = pickOne(ACTIONS);
  const fi = pickOne(IDPS);
  const fs = pickOne(SPS);
  const time = randomTime(day);
  const eidas = pickOne([1, 2, 3]);
  const geoloc = pickOne(CITY);
  const pid = randomID();
  const userIp = randomIPS();

  return appendRnippStatus(
    appendAccountId({
      ...basic,
      pid,
      fi,
      fs,
      fs_label: fs,
      fi_label: fi,
      action,
      type_action: type,
      time,
      eidas,
      geoloc_city_name: geoloc,
      userIp,
    })
  );
}

function getDateRangeArray(start, stop) {
  const range = [];

  for (
    let day = new Date(start.getTime());
    day <= stop;
    day.setDate(day.getDate() + 1)
  ) {
    range.push(new Date(day.getTime()));
  }

  return range;
}

function getDocToGenerateCount(countPerDay, variation) {
  const loopVariation = 1 + random(0 - variation, variation);

  const count = Math.floor(countPerDay * loopVariation);

  return count;
}

async function indexDocs(list) {
  const bulk = [];
  const bulkList = [];

  const header = {
    index: { _index: 'franceconnect' },
  };

  list.forEach(doc => {
    bulk.push(JSON.stringify(header));
    bulk.push(JSON.stringify(doc));

    if (bulk.length >= CHUNK_SIZE * 2) {
      bulkList.push(ESClient.bulk({ refresh: true, body: bulk }));
      bulk.length = 0;
    }
  });

  if (bulk.length) {
    bulkList.push(ESClient.bulk({ refresh: true, body: bulk }));
  }

  return Promise.all(bulkList);
}

async function subGenerate(total, documents, range, countPerDay, variation) {
  if (!range.length) {
    if (documents.length) {
      await indexDocs(documents);
    }
    return;
  }
  const day = range.pop();
  const count = getDocToGenerateCount(countPerDay, variation);

  COUNTER += count;
  for (let i = 0; i < count; i += 1) {
    documents.push(generateDocument(day));
  }

  const progress = (COUNTER / total) * 100;
  process.stdout.write(
    `${Math.ceil(progress)}% - ${COUNTER} / ${total} (±${variation *
      100}%)               \r`
  );

  if (documents.length >= CHUNK_SIZE) {
    await indexDocs(documents).then(() => {
      setTimeout(() => {
        subGenerate(total, [], range, countPerDay, variation);
      }, 0);
    });
  } else {
    setTimeout(() => {
      subGenerate(total, documents, range, countPerDay, variation);
    }, 0);
  }
}

async function generate(start, stop, countPerDay, variation) {
  // localhost:9200 is the default URL of ElasticSearch server
  const host = await reachHost();
  ESClient = new elasticsearch.Client(host);

  const range = getDateRangeArray(start, stop);
  const total = range.length * countPerDay;

  ACCOUNTS = generateAccounts(30);

  await subGenerate(total, [], range, countPerDay, variation);
}

const [, , start, stop, countPerDay, variation] = process.argv;

generate(
  new Date(start),
  new Date(stop),
  Number(countPerDay),
  Number(variation)
);
