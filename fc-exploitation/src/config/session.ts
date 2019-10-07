export default {
  secret: process.env.SESSION_SECRET || 'aufooquewooleng8Thahr6quei7Ais',
  name: process.env.SESSION_NAME || 'sessionId',
  resave: true,
  saveUninitialized: false,
};
