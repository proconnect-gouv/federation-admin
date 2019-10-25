import {
  USER_OPERATOR,
  USER_ONLY_ADMIN,
  USER_SECURITY,
  USER_PASS,
  LIMIT_PAGE,
} from '../../../../shared/cypress/integration/util/constants.util';
import { login, logout } from '../../../../shared/cypress/integration/util/login.util';
import { resetPostgres } from '../../../../shared/cypress/integration/util/prepare.util';

describe('Account', () => {
  before(resetPostgres);
	it('should redirect the not connected user to https://exploitation.docker.dev-franceconnect.fr/login', () => {
		cy.visit(`${Cypress.env('BASE_URL')}/account`);
		cy.url().should('eq', `${Cypress.env('BASE_URL')}/login`);
  });

  describe('User has the OPERATOR role', () => {
    beforeEach(() => {
      login(USER_OPERATOR, USER_PASS);
      cy.contains('Comptes utilisateurs').click();
    });

    it('checking account page is well displayed', () => {
      cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get('tbody th').then(userRows => {
        expect(userRows.length).to.be.greaterThan(0)
      });

      cy.get('#users-count').then(users => {
        const sentence = users[0].innerText.split(" ");
        const number = parseInt(sentence[0]);

        expect(number).to.be.a('number');
      });
      logout(USER_OPERATOR);
    });

    it('should\'nt give access to deletion buttons inside account list', () => {
      cy.get('form[name="deleteForm"]').should('not.exist');
      logout(USER_OPERATOR);
    });
  });

  describe('User has the ADMIN role', () => {
    it('should redirect the user who has just the admin role to the account list page when he connects himself', () => {
      login(USER_ONLY_ADMIN, USER_PASS);

      cy.url().should('eq', `${Cypress.env('BASE_URL')}/account`);
      cy.contains('Gestion des utilisateurs');
      cy.contains('Fournisseurs de service').should('not.exist');
      cy.contains('Fournisseurs d\'identité').should('not.exist');
      cy.get('form[name="deleteForm"]').should('exist');

      logout(USER_ONLY_ADMIN);
    });
  });

  describe('User has the SECURITY role', () => {
    beforeEach(() => {
      login(USER_SECURITY, USER_PASS)
    });

    it('should land on his post login page', () => {
      cy.url().should('eq', `${Cypress.env('APP_HOME_ROLE_SECURITY')}`);

      logout(USER_SECURITY);
    });

    it('should not be able to make any create, update or delete actions', () => {
      cy.contains(USER_SECURITY);

      // l'utilisateur ne voit pas les liens suivants dans exploit, et à fortiori dans les autres app
      // l'utilisateur ne voit pas RNIPP dans support
      cy.contains('Fournisseurs de données').should('not.exist');
      cy.contains('Redressement RNIPP').should('not.exist');
      cy.contains('Configuration').should('not.exist');

      // l'utilisateur ne voit pas les liens suivants dans stats, et à fortiori dans les autres app
      cy.contains('Évènements').should('not.exist');
      cy.contains('Métriques').should('not.exist');

      cy.get('body > nav > div > div > ul > li')
        .each(elem => {
          const tab = elem[0].innerText;
          cy.contains(tab).click();
          cy.get('.btn').should('not.be.visible');
          cy.get('.btn-action-update').should('not.be.visible');
          cy.get('.btn-action_generate-client-secret').should('not.be.visible');
          cy.get('.btn-action-delete').should('not.be.visible');
      });

      logout(USER_SECURITY);
    });
  });
});
