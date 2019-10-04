import { BASE_URL } from '../constants.util';

describe('Unauthorized - error 401', () => {
  it('Should redirect on the login page if we are not connected', () => {
    cy.visit(`${BASE_URL}`);
    cy.url().should('eq', `${BASE_URL}/login`);
    cy.get('form').should('be.visible');
  });
});