import {
  BASE_URL,
  USER_ONLY_ADMIN,
  USER_PASS
} from '../constants.util';
import { login, logout } from '../login.util';

describe('Forbidden - error 403', () => {
  const option = {
    method: 'GET',
    url: `${BASE_URL}/events`,
    failOnStatusCode: false,
  };

  it('Should not possible to see content if we are not right roles', () => {
    login(USER_ONLY_ADMIN, USER_PASS);

    cy.visit(option);
    cy.url().should('eq', `${BASE_URL}/events`);
    cy.contains('Statistiques').should('be.visible');
    cy.get('nav').should('be.visible');
    cy.contains('Accès refusé').should('be.visible');

    cy
      .request(option)
      .then((response) => {
        expect(response.status).to.eq(403);
        expect(response.statusText).to.eq('Forbidden');
      });

    logout(USER_ONLY_ADMIN);
  });
});
