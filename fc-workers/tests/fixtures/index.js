#!/usr/bin/env node
// Transpile for ES6 code
// eslint-disable-next-line import/no-extraneous-dependencies
require('@babel/register');

const { existsSync } = require('fs');

const [, , script] = process.argv;

if (typeof script === 'undefined') {
  throw new Error('please add filename to the script');
}

const exist = existsSync(`tests/fixtures/${script}`);

if (exist) {
  // eslint-disable-next-line import/no-dynamic-require,global-require
  require(`./${script}`);
} else {
  throw new Error(`Script file ${script} doesn't exist`);
}
