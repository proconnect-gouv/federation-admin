import {
	USER_ADMIN,
	USER_PASS,
	LIMIT_PAGE,
} from '../../../../shared/cypress/integration/util/constants.util';
import { deleteUser } from './account-delete.util';
import { createUserAccount } from './account-create.util';
import { login, logout } from '../../../../shared/cypress/integration/util/login.util';
import { resetPostgres } from '../../../../shared/cypress/integration/util/prepare.util';

describe('Account', () => {
  before(resetPostgres);
	describe('Delete user', () => {
		const userInfo = {
			username: 'cypress',
			email: 'cypress@email.com',
		};

		const basicConfiguration = {
			confirmSuppression: true,
			adminRole: true,
			operatorRole: true,
			_csrf: true,
		};
		beforeEach(() => {
			login(USER_ADMIN, USER_PASS);
		});

		it('Should delete the user if confirm button is clicked and should be kept on the accounts list page after', () => {
			createUserAccount(userInfo, basicConfiguration);

			cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
			deleteUser(userInfo.username, basicConfiguration);

			cy.contains(`Le compte ${userInfo.username} a été supprimé avec succès !`).should('be.visible');
			cy.url().should('eq', `${Cypress.env('BASE_URL')}/account`);
			cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
			cy.contains(`${userInfo.username}`).should('not.be.visible');

			logout(USER_ADMIN);
		});

		describe('Should not delete the user', () => {
			it('If cancel button is clicked in the modal confirmation', () => {
				basicConfiguration.confirmSuppression = false;
				createUserAccount(userInfo, basicConfiguration);

				cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
				deleteUser(userInfo.username, basicConfiguration);

				cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
				cy.contains(`${userInfo.username}`).should('be.visible');

				basicConfiguration.confirmSuppression = true;
				deleteUser(userInfo.username, basicConfiguration);
				logout(USER_ADMIN);
			});

			it('If the csrf token is invalid', () => {
				createUserAccount(userInfo, basicConfiguration);

				cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
				cy.get(`form[data-element-title="${userInfo.username}"] input[name="_csrf"]`).then((user) => {
					user[0].value ='obviouslyBadCSRF';
				});

				deleteUser(userInfo.username, basicConfiguration);

				cy.contains('Error - 500').should('be.visible');

				cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
				deleteUser(userInfo.username, basicConfiguration);
				logout(USER_ADMIN);
			});

			it('If totp is not correct or empty', () => {
				createUserAccount(userInfo, basicConfiguration);

				cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
				cy.get(`form[data-element-title="${userInfo.username}"] button.btn-action-delete`).click();
				cy.wait(500);
				cy.contains(`Voulez-vous supprimer le compte ${userInfo.username} ?`);
				cy.contains('Confirmer').click();
				cy.contains(`Le TOTP n'a pas été saisi`).should('be.visible');
				cy.get('#totpModal').type('000000');
				cy.contains('Confirmer').click();
				cy.wait(500);
				cy.contains(`Le TOTP saisi n'est pas valide`).should('be.visible');
				cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
				cy.contains(`${userInfo.username}`).should('be.visible');

				deleteUser(userInfo.username, basicConfiguration);
				logout(USER_ADMIN);
			});
		});
	});
});
