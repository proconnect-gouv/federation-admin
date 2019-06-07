// Transpile for ES6 code
// eslint-disable-next-line import/no-extraneous-dependencies
require('@babel/register');

const app = require('./app.js').default;

const PORT = process.env.PORT || 3000;

app.start(PORT);
