import 'cypress-file-upload';
import { formType, formFill, formControl, totp } from './forms';
import {
  resetMongoFC,
  resetPostgres,
  resetEventsStats,
  resetMetricsStats,
} from './reset';
import { firstLogin, login, logout } from './login';
import { getUserActivationToken } from './get-user-activation-token';

Cypress.Commands.add('resetEnv', type => {
  switch (type) {
    case 'postgres':
      resetPostgres();
      break;
    case 'mongoFC':
      resetMongoFC();
      break;
    case 'events':
      resetEventsStats();
      break;
    case 'metrics':
      resetMetricsStats();
      break;
    default:
      cy.error('resetEnv needs a task name as parameter');
      break;
  }
});

Cypress.Commands.add('getUserActivationToken', getUserActivationToken);
Cypress.Commands.add('formFill', formFill);
Cypress.Commands.add('formControl', formControl);
Cypress.Commands.add('formType', formType);
Cypress.Commands.add('totp', { prevSubject: 'optional' }, totp);
Cypress.Commands.add('login', login);
Cypress.Commands.add('firstLogin', firstLogin);
Cypress.Commands.add('logout', logout);
