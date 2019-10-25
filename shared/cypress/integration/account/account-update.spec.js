import { getTotp } from '../../../../shared/cypress/integration/util/totp.util';
import { USER_ADMIN, USER_PASS, LIMIT_PAGE } from '../../../../shared/cypress/integration/util/constants.util';
import { login, logout } from '../../../../shared/cypress/integration/util/login.util';
import { createUserAndLogWith } from './account-create.util';
import { deleteUser } from './account-delete.util';
import { resetPostgres } from '../../../../shared/cypress/integration/util/prepare.util';

describe('Update account', () => {
  before(resetPostgres);
  const userInfo = {
    username: 'thomas',
    email: 'thomas@email.com',
    password: 'MyNewPassword10!!',
    confirmPassword: 'MyNewPassword10!!',
  };
  const basicConfiguration = {
    adminRole: true,
    operatorRole: true,
    securityRole: true,
    _csrf: true,
    submit: true,
    confirmSuppression: true,
    totp: true,
  };
  beforeEach(() => {
    login(USER_ADMIN, USER_PASS);
    createUserAndLogWith(userInfo, basicConfiguration);
  });

  afterEach(() => {
    cy.visit(`${Cypress.env('BASE_URL')}/account`);
    logout(userInfo.username);

    login(USER_ADMIN, USER_PASS);
    cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
    deleteUser(userInfo.username, basicConfiguration);
    logout(USER_ADMIN);
  });

  it('should be possible for a  user to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.get('#currentPassword').type('MyNewPassword10!!');
    cy.get('#password').type('MyPass10!!');
    cy.get('#confirm-password').type('MyPass10!!');

    cy.get('#secret > td').then(async secret => {
      const token = await getTotp(secret[0].textContent);
      cy.get('#_totp').type(token);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains('Le mot de passe a bien été mis à jour !');
  });

  it('should not be possible for a user entering a bad old password to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.get('#currentPassword').type('badPassword!!');
    cy.get('#password').type('MyPass10!!');
    cy.get('#confirm-password').type('MyPass10!!');
    cy.get('#secret > td').then(async secret => {
      const token = await getTotp(secret[0].textContent);
      cy.get('#_totp').type(token);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains(
      'Nouveau mot de pass non mis à jour, Ancien mot de passe incorrect.',
    );
    cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
  });

  it('should not be possible for a user entering a bad new password to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.get('#currentPassword').type('MyNewPassword10!!');
    cy.get('#password').type('badone!!');
    cy.get('#password').should('have.class', 'is-invalid');
    cy.get('#confirm-password').type('badone!!');
    cy.get('#secret > td').then(async secret => {
      const token = await getTotp(secret[0].textContent);
      cy.get('#_totp').type(token);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
  });

  it('should not be possible for a user entering a bad password confirmation to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.get('#currentPassword').type('MyNewPassword10!!');
    cy.get('#password').type('MyPass10!!');
    cy.get('#confirm-password').type('badconfirmation');
    cy.get('#confirm-password').should('have.class', 'is-invalid');
    cy.get('#secret > td').then(async secret => {
      const token = await getTotp(secret[0].textContent);
      cy.get('#_totp').type(token);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
  });

  it('should not be possible for a user entering a bad totp to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.get('#currentPassword').type('MyNewPassword10!!');
    cy.get('#password').type('MyPass10!!');
    cy.get('#confirm-password').type('MyPass10!!');
    cy.get('#_totp').type(123456);
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains("Le TOTP saisi n'est pas valide");
    cy.visit(`${Cypress.env('BASE_URL')}/account?page=1&limit=${LIMIT_PAGE}`);
  });
});
