const util = require('util');
const exec = util.promisify(require('child_process').exec);
const crypto = require('crypto');
const {
  CHUNK_SIZE,
  IDPS,
  SPS,
  ACTIONS,
  RNIPP_RESULT,
} = require('./generate-logs.conf');

let COUNTER = 0;

const ACCOUNTS = [];

function generateAccounts(count) {
  const numberToGenerate = Math.ceil(count / 10);

  for (let i = 0; i < numberToGenerate; i++) {
    ACCOUNTS.push(
      crypto
        .createHash('sha256')
        .update(`${i}${new Date().toISOString()}`)
        .digest('hex')
    );
  }
}

function pickOne(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function random(min, max) {
  min = Math.ceil(min * 100);
  max = Math.floor(max * 100);
  return (Math.floor(Math.random() * (max - min + 1)) + min) / 100;
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
  if (entry.action === 'rnippCheck') {
    return Object.assign(
      {
        rnippReturnValue: pickOne(RNIPP_RESULT),
      },
      entry
    );
  }

  return entry;
}

function appendAccountId(entry) {
  if (entry.type_action === 'initial') {
    return Object.assign(
      {
        accountId: pickOne(ACCOUNTS),
      },
      entry
    );
  }

  return entry;
}

function generateDocument(day) {
  const { action, type_action } = pickOne(ACTIONS);
  const fi = pickOne(IDPS);
  const fs = pickOne(SPS);
  const time = randomTime(day);

  return appendRnippStatus(
    appendAccountId({ fi, fs, action, type_action, time })
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

async function generate(start, stop, countPerDay, variation) {
  const range = getDateRangeArray(start, stop);
  const total = range.length * countPerDay;

  generateAccounts(30);

  subGenerate(total, [], range, countPerDay, variation);
}

function getDocToGenerateCount(countPerDay, variation) {
  const loopVariation = 1 + random(0 - variation, variation);

  const count = Math.floor(countPerDay * loopVariation);

  return count;
}

async function subGenerate(total, documents, range, countPerDay, variation) {
  if (range.length === 0) {
    if (documents.length > 0) {
      indexDocs(documents);
    }
    return;
  }
  const day = range.pop();
  const count = getDocToGenerateCount(countPerDay, variation);

  for (let i = 0; i < count; i++) {
    COUNTER++;
    documents.push(generateDocument(day));
  }

  const progress = (COUNTER / total) * 100;
  process.stdout.write(
    `${Math.ceil(progress)}% - ${COUNTER} / ${total} (±${variation *
      100}%)               \r`
  );

  if (documents.length >= CHUNK_SIZE) {
    indexDocs(documents).then(() => {
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

async function indexDocs(list) {
  let bulk = [];
  const bulkList = [];

  list.forEach(doc => {
    const header = {
      index: { _index: 'franceconnect', _id: doc._id },
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
  const command = `curl -H 'Content-Type: application/json' -s -XPUT 'http://elasticsearch:9200/_bulk' --data-binary '${body}'; echo`;

  return exec(command).catch(console.error);
}

const [, , start, stop, countPerDay, variation] = process.argv;

generate(
  new Date(start),
  new Date(stop),
  Number(countPerDay),
  Number(variation)
);
