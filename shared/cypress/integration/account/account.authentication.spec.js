import {
  USER_ADMIN,
  USER_PASS,
  LIMIT_PAGE,
} from '../../support/constants';
import { createUserAndLogWith } from './account-create.util';
import { deleteUser } from './account-delete.util';
  
describe('Authentication failures', () => {
  before(() => cy.resetEnv('postgres'));
  const BASE_URL = Cypress.config('baseUrl');
  describe('Login regular user', () => {
    it('should be possible for a user to login when using good username and password', () => {
      cy.login(USER_ADMIN, USER_PASS);
      cy.url().should('match', /(?!login)/)
    });

  it('should flash an error to the user trying to log in with a bad username', () => {
    cy.login('badUsername', USER_PASS);
    cy.url().should(
    'eq',
    `${BASE_URL}/login`,
    );
    cy.get('.login-form').contains('Connexion impossible');
  });

  it('should flash an error to the user trying to log in with a good username but a bad password', () => {
    cy.login(USER_ADMIN, 'badPassword');
    cy.url().should(
    'eq',
    `${BASE_URL}/login`,
    );
    cy.get('.login-form').contains('Connexion impossible');
    });
  });
    
  describe('First login new user', () => {
    const userInfo = {
      username: 'christophe',
      password: 'MyPassword10!!',
      email: 'christophe@email.com',
    };
    const basicConfiguration = {
      adminRole: true,
      operatorRole: true,
      securityRole: true,
      _csrf: true,
      confirmSuppression: true,
      submit: true,
      redirect: true,
      totp: true,
      totpNotFilled: false,
      totpFirstLogin: true,
      fast: true,
    };
    beforeEach(() => {
      cy.login(USER_ADMIN, USER_PASS);
    });
  
    it('should be possible for a new user to login when using good username, password and token', () => {
      createUserAndLogWith(userInfo, basicConfiguration);
      
      cy.login(USER_ADMIN, USER_PASS);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      deleteUser(userInfo.username, basicConfiguration);
    });
  
    it('should flash an error to the new user trying to log in with a bad username', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', userInfo.username, basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
      .find('[id="role-admin"]')
      .check();
      
      cy.totp(basicConfiguration);
      
      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);
        
        cy.getUserActivationToken(userInfo.username).then(({stdout: activationToken}) => {
          cy.visit(`/first-login/${activationToken}`);
          cy.formFill({ username: 'badUsername', password: tmpPassword }, { fast: true });
          cy.get('button[type="submit"]').click();
          
          cy.get('.login-form').contains('Connexion impossible');
          cy.login(USER_ADMIN, USER_PASS);
          cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
          deleteUser(userInfo.username, basicConfiguration);
        });
      });
    });
  
    it('should flash an error to the new user trying to log in with a good username but a bad password', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', userInfo.username, basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
      .find('[id="role-admin"]')
      .check();
      
      cy.totp(basicConfiguration);
      
      cy.get('#tmpPassword').then(tmpPassword => {
      cy.contains("Créer l'utilisateur").click();
      cy.logout(USER_ADMIN);
      
      cy.firstLogin(userInfo.username, 'badPassword');
      
      cy.get('.login-form').contains('Connexion impossible');
      cy.login(USER_ADMIN, USER_PASS);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      deleteUser(userInfo.username, basicConfiguration);
      });
    });
  
    it('should flash an error to the new user trying to log in with good username and password but a bad token', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', userInfo.username, basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
      .find('[id="role-admin"]')
      .check();
      
      cy.totp(basicConfiguration);
      
      cy.get('#tmpPassword').then(tmpPassword => {
      cy.contains("Créer l'utilisateur").click();
      cy.logout(USER_ADMIN);
      
      cy.firstLogin(userInfo.username, tmpPassword);
      cy.get('.login-form').contains('Connexion impossible');
      cy.login(USER_ADMIN, USER_PASS);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      deleteUser(userInfo.username, basicConfiguration);
      });
    });
  
    it('should flash an error to the new user entering a bad password', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'kevin', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
      .find('[id="role-admin"]')
      .check();
      
      cy.totp(basicConfiguration);
      
      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);
      
        cy.firstLogin('kevin', userInfo.password);
        cy.get('.login-form').contains('Connexion impossible');
        cy.firstLogin('kevin', userInfo.password);
        cy.get('.login-form').contains('Connexion impossible');
        cy.firstLogin('kevin', userInfo.password);
        cy.get('.login-form').contains('Connexion impossible');
        cy.firstLogin('kevin', userInfo.password);
        cy.get('.login-form').contains('Connexion impossible');
        cy.firstLogin('kevin', userInfo.password);
        cy.get('.login-form').contains("Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur");
        cy.firstLogin('kevin', tmpPassword);
        cy.get('.login-form').contains("Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur");

        cy.login(USER_ADMIN, USER_PASS);
        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        cy.get(`#${'kevin'} > .roles`).contains('Utilisateur bloqué');
        deleteUser('kevin', basicConfiguration);
      });
    });

    it('should flash an error to the new user having good credentials but a bad token', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Arthur', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
      .find('[id="role-admin"]')
      .check();
      
      cy.totp(basicConfiguration);
      
      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);
      
        cy.visit('/first-login/badToken1');
        cy.formFill({ username: 'Arthur', password: tmpPassword }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken2');
        cy.formFill({ username: 'Arthur', password: tmpPassword }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken3');
        cy.formFill({ username: 'Arthur', password: tmpPassword }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken4');
        cy.formFill({ username: 'Arthur', password: tmpPassword }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken5');
        cy.formFill({ username: 'Arthur', password: tmpPassword }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains("Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur");
  
        cy.firstLogin('Arthur', tmpPassword);
        cy.get('.login-form').contains("Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur");

        cy.login(USER_ADMIN, USER_PASS);
        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        cy.get(`#${'Arthur'} > .roles`).contains('Utilisateur bloqué');
        deleteUser('Arthur', basicConfiguration);
      });
    });

    it('should flash an error to the new user having bad token and password', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Tom', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
      .find('[id="role-admin"]')
      .check();
      
      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);
      
        cy.visit('/first-login/badToken1');
        cy.formFill({ username: 'Tom', password: 'badPassword1' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken2');
        cy.formFill({ username: 'Tom', password: 'badPassword2' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken3');
        cy.formFill({ username: 'Tom', password: 'badPassword3' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken4');
        cy.formFill({ username: 'Tom', password: 'badPassword4' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken5');
        cy.formFill({ username: 'Tom', password: 'badPassword5' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains("Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur");
  
        cy.firstLogin('Tom', tmpPassword);
        cy.get('.login-form').contains("Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur");

        cy.login(USER_ADMIN, USER_PASS);
        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        cy.get(`#${'Tom'} > .roles`).contains('Utilisateur bloqué');
        deleteUser('Tom', basicConfiguration);
      });
    });

    it('should flash an error to the new user having bad username and token', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Tristan', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
      .find('[id="role-admin"]')
      .check();
      
      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);
      
        cy.visit('/first-login/badToken1');
        cy.formFill({ username: 'BadUser1', password: 'badPassword1' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken2');
        cy.formFill({ username: 'BadUser2', password: 'badPassword2' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken3');
        cy.formFill({ username: 'BadUser3', password: 'badPassword3' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken4');
        cy.formFill({ username: 'BadUser4', password: 'badPassword4' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken5');
        cy.formFill({ username: 'BadUser5', password: 'badPassword5' }, { fast: true });
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');
        
        cy.login(USER_ADMIN, USER_PASS);
        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        deleteUser('Tristan', basicConfiguration);
      });
    });
  
    it.skip('should flash an error to the new user trying to log in with an expired token', () => {
      // TODO
      // it's a test we need to come back on but whish is not doable for now.
      // tokenExpiresAt is set 48 hours after its creation, so we can't set it on the fly, we need to use user fixtures.
      // Thing is for a reason we haven't identified yet, fixtures do not fulfill tokenExpiresAt field.
      // And so the test is not doable for now. 
    });
  });
})
  