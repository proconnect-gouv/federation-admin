const { defineConfig } = require('cypress');

const pluginConfig = require('./cypress/plugins');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://fc-support.docker.dev-franceconnect.fr',
    setupNodeEvents(on, config) {
      return pluginConfig(on, config);
    },
    specPattern: 'cypress/integration/**/*.js',
    excludeSpecPattern: 'cypress/integration/**/*.utils.js',
    supportFile: 'cypress/support/index.js',
    retries: 2,
    video: false,
    experimentalRunAllSpecs: true,
  },
  env: {
    APP_NAME: 'support',
    APP_HOME_ROLE_ADMIN:
      'https://fc-support.docker.dev-franceconnect.fr/account',
    APP_HOME_ROLE_OPERATOR:
      'https://fc-support.docker.dev-franceconnect.fr/rnipp',
    APP_HOME_ROLE_SECURITY:
      'https://fc-support.docker.dev-franceconnect.fr/account',
    APP_FORBIDDEN_PAGE: 'https://fc-support.docker.dev-franceconnect.fr/rnipp',
    TOTP_WINDOW: 'loose',
    LOG_FILE_PATH: '../../fc/docker/volumes/log/fcsupport.log',
  },
  chromeWebSecurity: false,
  viewportHeight: 1800,
  viewportWidth: 1400,
  pageLoadTimeout: 30000,
});
