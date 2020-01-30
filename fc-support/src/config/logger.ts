export default {
  path: process.env.EVT_LOG_FILE || '/tmp/fcsupport.log',
  level: process.env.LOG_LEVEL || 'info',
  isDevelopement: process.env.NODE_ENV === 'development',
};
