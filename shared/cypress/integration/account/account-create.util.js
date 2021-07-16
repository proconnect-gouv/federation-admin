import {
  USER_ADMIN,
  LIMIT_PAGE,
} from '../../../../shared/cypress/support/constants';
import { deleteUser } from './account-delete.util';

export function createUserAccount(userInfo, basicConfiguration) {
  cy.contains('Comptes utilisateurs').click();
  cy.contains('Créer un utilisateur').click();
  cy.wait(1);

  cy.formType('#username', userInfo.username, basicConfiguration);
  cy.formType('#email', userInfo.email, basicConfiguration);

  if (basicConfiguration.adminRole) {
    cy.get('form')
      .find('[id="role-admin"]')
      .check();
  }

  if (basicConfiguration.operatorRole) {
    cy.get('form')
      .find('[id="role-operator"]')
      .check();
  }

  if (basicConfiguration.securityRole) {
    cy.get('form')
      .find('[id="role-security"]')
      .check();
  }

  if (!basicConfiguration.totpNotFilled) {
    cy.totp(basicConfiguration);
  }

  // change csrf token
  if (!basicConfiguration._csrf) {
    cy.get('input[name="_csrf"]').then(csrf => {
      csrf[0].value = 'obviouslyBadCSRF';
    });
  }

  cy.contains("Créer l'utilisateur").click();
}

export function createUserAndLogWith(userInfo, basicConfiguration) {
  cy.contains('Comptes utilisateurs').click();
  cy.contains('Créer un utilisateur').click();
  cy.wait(1);

  cy.formType('#username', userInfo.username, basicConfiguration);
  cy.formType('#email', userInfo.email, basicConfiguration);
  cy.get('form')
    .find('[id="role-admin"]')
    .check();
  cy.get('form')
    .find('[id="role-operator"]')
    .check();

  cy.totp(basicConfiguration);

  cy.get('#tmpPassword').then(tmpPassword => {
    cy.contains("Créer l'utilisateur").click();
    cy.logout(USER_ADMIN);
    // login with new user created
    cy.firstLogin(userInfo.username, tmpPassword[0].textContent);
  });

  // retrieve secret hash
  cy.get('#secret > td').then(async secret => {
    cy.formType('#password', userInfo.password, basicConfiguration);
    cy.formType(
      '#confirm-password',
      userInfo.confirmPassword,
      basicConfiguration,
    );

    cy.totp({ totp: basicConfiguration.totpFirstLogin }, secret[0].textContent);

    if (basicConfiguration.submit) {
      cy.get('button[type="submit"]').click();
    }
  });
}

export function deleteUserAndLogout(adminAccount, userToDelete, configuration) {
  cy.login(adminAccount.admin, adminAccount.adminPass);
  cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  cy.wait(1);

  deleteUser(userToDelete, configuration);
  cy.logout(adminAccount.admin);
}
