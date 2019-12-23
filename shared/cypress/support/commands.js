import { formType, formFill, formControl, totp } from './forms';
import { resetMongoFC, resetPostgres, resetElasticStats } from './reset';
import { login, logout } from './login';

Cypress.Commands.add('resetEnv', type => {
  switch (type) {
    case 'postgres':
      resetPostgres();
      break;
    case 'mongoFC':
      resetMongoFC();
      break;
    case 'elasticStats':
      resetElasticStats();
      break;
    default:
      cy.error('resetEnv needs a task name as parameter');
      break;
  }
});

Cypress.Commands.add('formFill', formFill);
Cypress.Commands.add('formControl', formControl);
Cypress.Commands.add('formType', formType);
Cypress.Commands.add('totp', { prevSubject: 'optional' }, totp);
Cypress.Commands.add('login', login);
Cypress.Commands.add('logout', logout);
