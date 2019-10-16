const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {
  CHUNK_SIZE,
  KEYS,
  RANGES,
  DEFAULT_AMOUNT_MIN,
  DEFAULT_AMOUNT_MAX,
} = require('./generate-metrics.conf');

const CURRENT_AMOUNTS = {};

function randomPrecision2(min, max) {
  min = Math.ceil(min * 100);
  max = Math.floor(max * 100);
  return (Math.floor(Math.random() * (max - min + 1)) + min) / 100;
}

function initAmounts() {
  KEYS.forEach(metric => {
    RANGES.forEach(range => {
      CURRENT_AMOUNTS[`${metric}_${range}`] = Math.floor(
        randomPrecision2(DEFAULT_AMOUNT_MIN[range], DEFAULT_AMOUNT_MAX[range])
      );
    });
  });
}

function addDays(from, days) {
  const date = new Date(from.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

function generate(start, stop) {
  let day = new Date(start);
  let docs = [];

  while (day.toISOString() <= stop.toISOString()) {
    docs = docs.concat(generateDay(day));
    day = addDays(day, 1);
  }

  indexDocs(docs);
}

function generateDay(day) {
  let docs = [];

  docs = docs.concat(generateMetrics(day, 'day'));
  // First day of week
  if (day.getDay() === 1) {
    docs = docs.concat(generateMetrics(day, 'week'));
  }
  // First day of month
  if (day.getDate() === 1) {
    docs = docs.concat(generateMetrics(day, 'month'));
  }
  // First day of year
  if (`${day.getDate()}/${day.getMonth()}` === '1/0') {
    docs = docs.concat(generateMetrics(day, 'year'));
  }

  return docs;
}

function generateMetrics(day, range) {
  return KEYS.map(metric => generateMetric(day, range, metric));
}

function generateMetric(day, range, metric) {
  const currentVariation = 1 + randomPrecision2(0, VARIATION);

  CURRENT_AMOUNTS[`${metric}_${range}`] = Math.floor(
    CURRENT_AMOUNTS[`${metric}_${range}`] * currentVariation
  );

  return {
    key: metric,
    value: CURRENT_AMOUNTS[`${metric}_${range}`],
    range,
    date: day,
  };
}

async function indexDocs(list) {
  let bulk = [];
  const bulkList = [];

  list.forEach(doc => {
    const header = {
      index: { _index: 'stats', _type: 'metric', _id: doc._id },
    };
    bulk.push(JSON.stringify(header));
    bulk.push(JSON.stringify(doc));

    if (bulk.length >= CHUNK_SIZE * 2) {
      bulkList.push(sendToElastic(bulk));
      bulk = [];
    }
  });

  if (bulk.length > 0) {
    bulkList.push(sendToElastic(bulk));
  }

  return Promise.all(bulkList);
}

function sendToElastic(bulk) {
  const body = `${bulk.join('\n')}\n`;
  const command = `curl -s -XPUT 'http://elasticsearch:9200/_bulk' --data-binary '${body}}'; echo`;

  return exec(command);
}

const [, , start, stop, VARIATION] = process.argv;

initAmounts();
generate(new Date(start), new Date(stop));
