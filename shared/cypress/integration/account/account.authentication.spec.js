import { USER_ADMIN, USER_PASS, LIMIT_PAGE } from '../../support/constants';
import { createUserAndLogWith } from './account-create.util';
import { deleteUser } from './account-delete.util';
import { getTotp } from '../../support/totp';

describe('Authentication failures', () => {
  before(() => cy.resetEnv('postgres'));
  const BASE_URL = Cypress.config('baseUrl');
  describe('Login regular user', () => {
    it('should be possible for a user to login when using good username and password', () => {
      cy.login(USER_ADMIN, USER_PASS);
      cy.url().should('match', /(?!login)/);
    });

    it('should flash an error to the user trying to log in with a bad username', () => {
      cy.login('badUsername', USER_PASS);
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');
    });

    it('should flash an error to the user trying to log in with a good username but a bad password', () => {
      cy.login(USER_ADMIN, 'badPassword');
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');
    });

    it('should flash an error to the user trying to log in with a bad TOTP', () => {
      cy.visit('/login');
      cy.formFill(
        { username: USER_ADMIN, password: USER_PASS },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');
    });

    it('should flash an error to the user trying to log in with a bad TOTP and invalid credentials', () => {
      cy.visit('/login');
      cy.formFill(
        { username: 'tata', password: 'titi' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');
    });

    it('should block the user after the fifth error on his password', () => {
      cy.visit('/login');

      cy.formFill(
        { username: 'pwd_fail', password: 'badPassword1' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'pwd_fail', password: 'badPassword2' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'pwd_fail', password: 'badPassword3' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'pwd_fail', password: 'badPassword4' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'pwd_fail', password: 'badPassword5' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains(
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );

      cy.formFill(
        { username: 'pwd_fail', password: 'georgesmoustaki' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains(
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );

      cy.formFill(
        { username: USER_ADMIN, password: USER_PASS },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get(`#${'pwd_fail'} > .roles`).contains('Utilisateur bloqué');
      cy.logout(USER_ADMIN);
    });

    it('should block the user after the fifth error on his totp', () => {
      cy.visit('/login');

      cy.formFill(
        { username: 'totp_fail', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'totp_fail', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'totp_fail', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'totp_fail', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'totp_fail', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains(
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );

      cy.formFill(
        { username: 'totp_fail', password: 'georgesmoustaki' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains(
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );

      cy.formFill(
        { username: USER_ADMIN, password: USER_PASS },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get(`#${'totp_fail'} > .roles`).contains('Utilisateur bloqué');
      cy.logout(USER_ADMIN);
    });

    it('should block the user after the fifth error on his password and his totp', () => {
      cy.visit('/login');

      cy.formFill(
        { username: 'pwd_totp_fail', password: 'badPassword1' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'pwd_totp_fail', password: 'badPassword2' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'pwd_totp_fail', password: 'badPassword3' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'pwd_totp_fail', password: 'badPassword4' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'pwd_totp_fail', password: 'badPassword5' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains(
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );

      cy.formFill(
        { username: 'pwd_totp_fail', password: 'georgesmoustaki' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains(
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );

      cy.formFill(
        { username: USER_ADMIN, password: USER_PASS },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get(`#${'pwd_totp_fail'} > .roles`).contains('Utilisateur bloqué');
      cy.logout(USER_ADMIN);
    });

    it("should flash 'Connexion impossible' to the user failling four times his password, logging in, out, then failling again his password", () => {
      cy.visit('/login');

      cy.formFill(
        { username: USER_ADMIN, password: 'badPassword1' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: USER_ADMIN, password: 'badPassword2' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: USER_ADMIN, password: 'badPassword3' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: USER_ADMIN, password: 'badPassword4' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: USER_ADMIN, password: USER_PASS },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.logout(USER_ADMIN);

      cy.formFill(
        { username: USER_ADMIN, password: 'badPassword5' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');
    });

    it("should flash 'Connexion impossible' to the user failling four times his totp, logging in, out, then failling again his totp", () => {
      cy.visit('/login');

      cy.formFill(
        { username: 'jean_patoche', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'jean_patoche', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'jean_patoche', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'jean_patoche', password: 'georgesmoustaki' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'jean_patoche', password: 'georgesmoustaki' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.logout('jean_patoche');

      cy.formFill(
        { username: 'jean_patoche', password: USER_PASS },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');
    });

    it("should flash 'Connexion impossible' to the user failling four times his password and totp, logging in, out, then failling again his password and totp", () => {
      cy.visit('/login');

      cy.formFill(
        { username: 'fred', password: 'badPassword1' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'fred', password: 'badPassword2' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'fred', password: 'badPassword3' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'fred', password: 'badPassword4' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
      cy.get('.login-form').contains('Connexion impossible');

      cy.formFill(
        { username: 'fred', password: 'georgesmoustaki' },
        { totp: true, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.logout('fred');

      cy.formFill(
        { username: 'fred', password: 'badPassword5' },
        { totp: false, fast: true },
      );
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', `${BASE_URL}/login`);
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

        cy.getUserActivationToken(userInfo.username).then(
          ({ stdout: activationToken }) => {
            cy.visit(`/first-login/${activationToken}`);
            cy.formFill(
              { username: 'badUsername', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();

            cy.get('.login-form').contains('Connexion impossible');
            cy.login(USER_ADMIN, USER_PASS);
            cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
            deleteUser(userInfo.username, basicConfiguration);
          },
        );
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

        cy.getUserActivationToken(userInfo.username).then(
          ({ stdout: activationToken }) => {
            cy.visit('/first-login/badToken');
            cy.formFill(
              { username: userInfo.username, password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();

            cy.get('.login-form').contains('Connexion impossible');
            cy.login(USER_ADMIN, USER_PASS);
            cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
            deleteUser(userInfo.username, basicConfiguration);
          },
        );
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

        cy.firstLogin('kevin', 'BadPasswor1');
        cy.get('.login-form').contains('Connexion impossible');
        cy.firstLogin('kevin', 'BadPasswor2');
        cy.get('.login-form').contains('Connexion impossible');
        cy.firstLogin('kevin', 'BadPasswor3');
        cy.get('.login-form').contains('Connexion impossible');
        cy.firstLogin('kevin', 'BadPasswor4');
        cy.get('.login-form').contains('Connexion impossible');
        cy.firstLogin('kevin', 'BadPasswor5');
        cy.get('.login-form').contains(
          "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
        );
        cy.firstLogin('kevin', tmpPassword);
        cy.get('.login-form').contains(
          "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
        );

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
        cy.formFill(
          { username: 'Arthur', password: tmpPassword[0].textContent },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken2');
        cy.formFill(
          { username: 'Arthur', password: tmpPassword },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken3');
        cy.formFill(
          { username: 'Arthur', password: tmpPassword },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken4');
        cy.formFill(
          { username: 'Arthur', password: tmpPassword },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken5');
        cy.formFill(
          { username: 'Arthur', password: tmpPassword },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains(
          "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
        );

        cy.firstLogin('Arthur', tmpPassword);
        cy.get('.login-form').contains(
          "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
        );

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
        cy.formFill(
          { username: 'Tom', password: 'badPassword1' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken2');
        cy.formFill(
          { username: 'Tom', password: 'badPassword2' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken3');
        cy.formFill(
          { username: 'Tom', password: 'badPassword3' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken4');
        cy.formFill(
          { username: 'Tom', password: 'badPassword4' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken5');
        cy.formFill(
          { username: 'Tom', password: 'badPassword5' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains(
          "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
        );

        cy.firstLogin('Tom', tmpPassword[0].textContent);
        cy.get('.login-form').contains(
          "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
        );

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
        cy.formFill(
          { username: 'BadUser1', password: 'badPassword1' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken2');
        cy.formFill(
          { username: 'BadUser2', password: 'badPassword2' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken3');
        cy.formFill(
          { username: 'BadUser3', password: 'badPassword3' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken4');
        cy.formFill(
          { username: 'BadUser4', password: 'badPassword4' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.visit('/first-login/badToken5');
        cy.formFill(
          { username: 'BadUser5', password: 'badPassword5' },
          { fast: true },
        );
        cy.get('button[type="submit"]').click();
        cy.get('.login-form').contains('Connexion impossible');

        cy.login(USER_ADMIN, USER_PASS);
        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        deleteUser('Tristan', basicConfiguration);
      });
    });

    it('should block the user after the fifth error on his password', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Margot', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
        .find('[id="role-admin"]')
        .check();

      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);

        cy.getUserActivationToken('Margot').then(
          ({ stdout: activationToken }) => {
            cy.visit(`/first-login/${activationToken}`);
            cy.formFill(
              { username: 'Margot', password: 'badPassword1' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.formFill(
              { username: 'Margot', password: 'badPassword2' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.formFill(
              { username: 'Margot', password: 'badPassword3' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.formFill(
              { username: 'Margot', password: 'badPassword4' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.formFill(
              { username: 'Margot', password: 'badPassword5' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains(
              "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
            );
        });
      });

      cy.visit('/login')
      cy.login(USER_ADMIN, USER_PASS);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get(`#${'Margot'} > .roles`).contains('Utilisateur bloqué');
      deleteUser('Margot', basicConfiguration);
    });

    it('should block the user after the fifth error on his token', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Laetitia', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
        .find('[id="role-admin"]')
        .check();

      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);

        cy.getUserActivationToken('Laetitia').then(
          ({ stdout: activationToken }) => {
            cy.visit('/first-login/badToken1');
            cy.formFill(
              { username: 'Laetitia', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badToken2');
            cy.formFill(
              { username: 'Laetitia', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badToken3');
            cy.formFill(
              { username: 'Laetitia', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badToken4');
            cy.formFill(
              { username: 'Laetitia', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badToken5');
            cy.formFill(
              { username: 'Laetitia', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains(
              "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
            );
        });
      });

      cy.visit('/login')
      cy.login(USER_ADMIN, USER_PASS);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get(`#${'Laetitia'} > .roles`).contains('Utilisateur bloqué');
      deleteUser('Laetitia', basicConfiguration);
    });

    it('should block the user after the fifth error on his password and his token', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Marie', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
        .find('[id="role-admin"]')
        .check();

      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);

        cy.getUserActivationToken('Marie').then(
          ({ stdout: activationToken }) => {
            cy.visit('/first-login/badToken1');
            cy.formFill(
              { username: 'Marie', password: 'badPassword1' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badToken2');
            cy.formFill(
              { username: 'Marie', password: 'badPassword2' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badToken3');
            cy.formFill(
              { username: 'Marie', password: 'badPassword3' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badToken4');
            cy.formFill(
              { username: 'Marie', password: 'badPassword4' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badToken5');
            cy.formFill(
              { username: 'Marie', password: 'badPassword5' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains(
              "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
            );
        });
      });

      cy.visit('/login')
      cy.login(USER_ADMIN, USER_PASS);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get(`#${'Marie'} > .roles`).contains('Utilisateur bloqué');
      deleteUser('Marie', basicConfiguration);
    });

    it("should flash 'Connexion impossible' to the new user failling four times his password, logging in, out, then failling again his password", () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Dominique', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
        .find('[id="role-admin"]')
        .check();

      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);

        cy.getUserActivationToken('Dominique').then(
          ({ stdout: activationToken }) => {
            cy.visit(`/first-login/${activationToken}`);
            cy.formFill(
              { username: 'Dominique', password: 'badPassword1' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.formFill(
              { username: 'Dominique', password: 'badPassword2' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.formFill(
              { username: 'Dominique', password: 'badPassword3' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.formFill(
              { username: 'Dominique', password: 'badPassword4' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.formFill(
              { username: 'Dominique', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('#password').type(tmpPassword[0].textContent);
            cy.get('#confirm-password').type(tmpPassword[0].textContent);
            cy.get('#secret > td').then(secret => {
              const token = getTotp(secret[0].textContent)
              cy.get('#_totp').type(token);
              cy.get('button[type="submit"]').click();
              cy.logout('Dominique');

              cy.formFill(
                { username: 'Dominique', password: 'badPassword5' },
                { fast: true },
              );
              cy.get('button[type="submit"]').click();
              cy.get('.login-form').contains('Connexion impossible');
  
              cy.visit('/login')
              cy.login(USER_ADMIN, USER_PASS);
              cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
              deleteUser('Dominique', basicConfiguration);
            });
          },
        );
      });
    });

    it("should flash 'Connexion impossible' to the new user failling four times his token, logging in, out, then failling again his authentication", () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Cyril', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
        .find('[id="role-admin"]')
        .check();

      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);

        cy.getUserActivationToken('Cyril').then(
          ({ stdout: activationToken }) => {
            cy.visit('/first-login/badTohen1');
            cy.formFill(
              { username: 'Cyril', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badTohen2');
            cy.formFill(
              { username: 'Cyril', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badTohen3');
            cy.formFill(
              { username: 'Cyril', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badTohen4');
            cy.formFill(
              { username: 'Cyril', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit(`/first-login/${activationToken}`);
            cy.formFill(
              { username: 'Cyril', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('#password').type(tmpPassword[0].textContent);
            cy.get('#confirm-password').type(tmpPassword[0].textContent);
            cy.get('#secret > td').then(secret => {
              const token = getTotp(secret[0].textContent)
              cy.get('#_totp').type(token);
              cy.get('button[type="submit"]').click();
              cy.logout('Cyril');

              cy.formFill(
                { username: 'Cyril', password: 'badPassword5' },
                { fast: true },
              );
              cy.get('button[type="submit"]').click();
              cy.get('.login-form').contains('Connexion impossible');
  
              cy.visit('/login')
              cy.login(USER_ADMIN, USER_PASS);
              cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
              deleteUser('Cyril', basicConfiguration);
            });
          },
        );
      });
    });

    it("should flash 'Connexion impossible' to the new user failling four times his password and totp, logging in, out, then failling again his authentication", () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'Mathias', basicConfiguration);
      cy.formType('#email', userInfo.email, basicConfiguration);
      cy.get('form')
        .find('[id="role-admin"]')
        .check();

      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);

        cy.getUserActivationToken('Mathias').then(
          ({ stdout: activationToken }) => {
            cy.visit('/first-login/badTohen1');
            cy.formFill(
              { username: 'Mathias', password: 'badPassword1' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badTohen2');
            cy.formFill(
              { username: 'Mathias', password: 'badPassword2' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badTohen3');
            cy.formFill(
              { username: 'Mathias', password: 'badPassword3' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit('/first-login/badTohen4');
            cy.formFill(
              { username: 'Mathias', password: 'badPassword4' },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.visit(`/first-login/${activationToken}`);
            cy.formFill(
              { username: 'Mathias', password: tmpPassword[0].textContent },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('#password').type(tmpPassword[0].textContent);
            cy.get('#confirm-password').type(tmpPassword[0].textContent);
            cy.get('#secret > td').then(secret => {
              const token = getTotp(secret[0].textContent)
              cy.get('#_totp').type(token);
              cy.get('button[type="submit"]').click();
              cy.logout('Mathias');

              cy.formFill(
                { username: 'Mathias', password: 'badPassword5' },
                { fast: true },
              );
              cy.get('button[type="submit"]').click();
              cy.get('.login-form').contains('Connexion impossible');
  
              cy.visit('/login')
              cy.login(USER_ADMIN, USER_PASS);
              cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
              deleteUser('Mathias', basicConfiguration);
            });
          },
        );
      });
    });

    it.skip('should flash an error to the new user trying to log in with an expired token', () => {
      // TODO
      // it's a test we need to come back on but whish is not doable for now.
      // tokenExpiresAt is set 48 hours after its creation, so we can't set it on the fly, we need to use user fixtures.
      // Thing is for a reason we haven't identified yet, fixtures do not fulfill tokenExpiresAt field.
      // And so the test is not doable for now.
    });

    it('should be impossible for a regular user to login through first login route without second authentication factor', () => {
      cy.contains('Comptes utilisateurs').click();
      cy.contains('Créer un utilisateur').click();
      cy.formType('#username', 'tempUser', basicConfiguration);
      cy.formType('#email', 'temp@temp.com', basicConfiguration);
      cy.get('form')
        .find('[id="role-admin"]')
        .check();

      cy.totp(basicConfiguration);

      cy.get('#tmpPassword').then(tmpPassword => {
        cy.contains("Créer l'utilisateur").click();
        cy.logout(USER_ADMIN);

        cy.getUserActivationToken('tempUser').then(
          ({ stdout: activationToken }) => {
            cy.visit(`/first-login/${activationToken}`);
            cy.formFill(
              { username: USER_ADMIN, password: USER_PASS },
              { fast: true },
            );
            cy.get('button[type="submit"]').click();
            cy.get('.login-form').contains('Connexion impossible');

            cy.login(USER_ADMIN, USER_PASS);
            cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
            deleteUser('tempUser', basicConfiguration);
          },
        );
      });
    });
  });
});
