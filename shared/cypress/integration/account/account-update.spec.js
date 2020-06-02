import {
  USER_ADMIN,
  USER_PASS,
  LIMIT_PAGE,
} from '../../../../shared/cypress/support/constants';
import { createUserAndLogWith } from './account-create.util';
import { deleteUser } from './account-delete.util';
import { updatePassword } from './account-update.util';
import { testIsCompliantPasswordUpdate } from '../../support/request';

describe('Update account', () => {
  before(() => cy.resetEnv('postgres'));
  const userInfo = {
    username: 'thomas',
    email: 'thomas@email.com',
    password: 'MyNewPassword1!!',
    confirmPassword: 'MyNewPassword1!!',
  };
  const basicConfiguration = {
    adminRole: true,
    operatorRole: true,
    securityRole: true,
    _csrf: true,
    submit: true,
    confirmSuppression: true,
    totpAccountCreate: true,
    totpFirstLogin: true,
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

    cy.formType('#currentPassword', 'MyNewPassword1!!');
    cy.formType('#password', 'MyNewPassword20!!');
    cy.formType('#confirm-password', 'MyNewPassword20!!');

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
    cy.formType('#password', 'MyNewPassword22!!');
    cy.formType('#confirm-password', 'MyNewPassword22!!');

    cy.get('#secret > td').then(secret =>
      cy.totp(basicConfiguration, secret[0].textContent),
    );

    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains(
      'Nouveau mot de passe non mis à jour, Ancien mot de passe incorrect.',
    );
    cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  });

  it('should not be possible for a user entering a bad new password to update his password', () => {
    cy.contains('thomas').click();
    cy.contains('Mon compte').click();

    cy.formType('#currentPassword', 'MyNewPassword1!!');
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

    cy.formType('#currentPassword', 'MyNewPassword1!!');
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

    cy.formType('#currentPassword', 'MyNewPassword1!!');
    cy.formType('#password', 'MyNewPassword20!!');
    cy.formType('#confirm-password', 'MyNewPassword20!!');
    cy.formType('#_totp', 123456);
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains("Le TOTP saisi n'est pas valide");
    cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  });
});

describe('Patch update-account/:username', () => {
  beforeEach(() => {
    cy.login(USER_ADMIN, USER_PASS);
  });

  const basicConfiguration = {
    adminRole: true,
    operatorRole: true,
    securityRole: true,
    _csrf: true,
    confirmSuppression: true,
    submit: true,
    redirect: true,
    totp: true,
    fast: true,
  };

  afterEach(() => {
    cy.visit(`/logout`);
  });

  describe("is-compliant-validator", () => {
    it("should throw an error if his password is too short", () => {
      testIsCompliantPasswordUpdate(
        {...basicConfiguration},
        {
          password: 'short@Pass1',
          passwordConfirmation: 'short@Pass1',
          errorMessage: 'Le mot de passe saisi est invalide'
        });
    })

    it("should throw an error if his password does not contain lowercase letters", () => {
      testIsCompliantPasswordUpdate(
        {...basicConfiguration},
        {
          password: 'NO-LOWER@PASS10',
          passwordConfirmation: 'NO-LOWER@PASS10',
          errorMessage: 'Le mot de passe saisi est invalide'
        });
    })

    it("should throw an error if his password does not contain uppercase letters", () => {
      testIsCompliantPasswordUpdate(
        {...basicConfiguration},
        {
          password: 'no-upper@pass1',
          passwordConfirmation: 'no-upper@pass1',
          errorMessage: 'Le mot de passe saisi est invalide'
        });
    })

    it("should throw an error if his password does not contain special characters", () => {
      testIsCompliantPasswordUpdate(
        {...basicConfiguration},
        {
          passwordConfirmation: 'NoSpecialChars123',
          passwordConfirmation: 'NoSpecialChars123',
          errorMessage: 'Le mot de passe saisi est invalide'
        });
    })

    it("should throw an error if his password does not contain numbers", () => {
      testIsCompliantPasswordUpdate(
        {...basicConfiguration},
        {
          password: 'NoNumbers@TryAgainBuddy',
          passwordConfirmation: 'NoNumbers@TryAgainBuddy',
          errorMessage: 'Le mot de passe saisi est invalide'
        });
    })
  });
  
  describe("isSameAS", () => {
    it('should throw an error if his passwords do not match', () => {
      testIsCompliantPasswordUpdate(
        {...basicConfiguration},
        {
          password: 'DoesNotMatch@TryAgainBuddy',
          passwordConfirmation: 'NotMatching@TryAgainBuddy',
          errorMessage: 'Les mots de passe fournis ne correspondent pas'
        });
    });
  });
});

describe("isEqualToOneOfTheLastFivePasswords", () => {
  before(() => cy.resetEnv('postgres'));
  const userInfo = {
    username: 'bill',
    email: 'bill@email.com',
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
    totpAccountCreate: true,
    totpFirstLogin: true,
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
  it('should update password if not equal to one of the last five passwords', () => {
    updatePassword(basicConfiguration);
  });
});
