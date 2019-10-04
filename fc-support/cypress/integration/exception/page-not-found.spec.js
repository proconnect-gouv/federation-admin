import {
  BASE_URL,
  USER_OPERATOR,
  USER_PASS
} from '../constants.util';
import { login, logout } from '../login.util';

describe('Page not found - error 404', () => {
  const option = {
    method: 'GET',
    url: `${BASE_URL}/wrong-page`,
    failOnStatusCode: false,
  };

  it('Should display the page not found when we are not connected', () => {
    cy.visit(option);
    cy.url().should('eq', `${BASE_URL}/wrong-page`);
    cy.contains('Support').should('not.exist');
    cy.contains('Oops, la page est introuvable...').should('be.visible');

    cy
      .request(option)
      .then((response) => {
        expect(response.status).to.eq(404);
        expect(response.statusText).to.eq('Not Found');
      });
  });

  it('Should display the page not found when we are connected', () => {
    login(USER_OPERATOR, USER_PASS);

    cy.visit(option);
    cy.url().should('eq', `${BASE_URL}/wrong-page`);
    cy.contains('Support').should('be.visible');
    cy.get('nav').should('be.visible');
    cy.contains('Oops, la page est introuvable...').should('be.visible');

    cy
      .request(option)
      .then((response) => {
        expect(response.status).to.eq(404);
        expect(response.statusText).to.eq('Not Found');
      });

    logout(USER_OPERATOR);
  });
});