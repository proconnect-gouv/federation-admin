import {
  USER_ADMIN,
  USER_PASS,
  LIMIT_PAGE,
} from '../../../../shared/cypress/support/constants';
import { createUserAndLogWith } from './account-create.util';
import { deleteUser } from './account-delete.util';

describe('Update account', () => {
  before(() => cy.resetEnv('postgres'));
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
    fast: true,
  };
  beforeEach(() => {
    cy.login(USER_ADMIN, USER_PASS);
    createUserAndLogWith(userInfo, basicConfiguration);
  });

  afterEach(() => {
    cy.visit(`/account`);
    cy.logout(userInfo.username);

    cy.login(USER_ADMIN, USER_PASS);
    cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
    deleteUser(userInfo.username, basicConfiguration);
    cy.logout(USER_ADMIN);
  });

  it('should be possible for a  user to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.formType('#currentPassword', 'MyNewPassword10!!');
    cy.formType('#password', 'MyPass10!!');
    cy.formType('#confirm-password', 'MyPass10!!');

    cy.get('#secret > td').then(async secret => {
      await cy.totp(basicConfiguration, secret[0].textContent);
    });

    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains('Le mot de passe a bien été mis à jour !');
  });

  it('should not be possible for a user entering a bad old password to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.formType('#currentPassword', 'badPassword!!');
    cy.formType('#password', 'MyPass10!!');
    cy.formType('#confirm-password', 'MyPass10!!');

    cy.get('#secret > td').then(secret =>
      cy.totp(basicConfiguration, secret[0].textContent),
    );

    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains(
      'Nouveau mot de pass non mis à jour, Ancien mot de passe incorrect.',
    );
    cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  });

  it('should not be possible for a user entering a bad new password to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.formType('#currentPassword', 'MyNewPassword10!!');
    cy.formType('#password', 'badone!!', { typeEvent: true });
    cy.get('#password').should('have.class', 'is-invalid');
    cy.formType('#confirm-password', 'badone!!');

    cy.get('#secret > td').then(secret =>
      cy.totp(basicConfiguration, secret[0].textContent),
    );

    cy.contains('Mettre à jour mon mot de passe').click();
    cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  });

  it('should not be possible for a user entering a bad password confirmation to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.formType('#currentPassword', 'MyNewPassword10!!');
    cy.formType('#password', 'MyPass10!!');
    cy.formType('#confirm-password', 'badconfirmation', { typeEvent: true });
    cy.get('#confirm-password').should('have.class', 'is-invalid');

    cy.get('#secret > td').then(secret =>
      cy.totp(basicConfiguration, secret[0].textContent),
    );

    cy.contains('Mettre à jour mon mot de passe').click();
    cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  });

  it('should not be possible for a user entering a bad totp to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.formType('#currentPassword', 'MyNewPassword10!!');
    cy.formType('#password', 'MyPass10!!');
    cy.formType('#confirm-password', 'MyPass10!!');
    cy.formType('#_totp', 123456);
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains("Le TOTP saisi n'est pas valide");
    cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  });
});
