import {
  USER_ADMIN,
  USER_PASS,
  LIMIT_PAGE,
} from '../../support/constants';
import { createUserAccount, createUserAndLogWith } from './account-create.util';
import { deleteUser } from './account-delete.util';
import { testIsCompliantPasswordEnrollment } from '../../support/request';

const BASE_URL = Cypress.config('baseUrl');

function logoutAndDeleteUser(username, basicConfiguration) {
  if (basicConfiguration.redirect) {
    cy.visit(`/account`);
    cy.logout(username);
  }
  cy.login(USER_ADMIN, USER_PASS);
  cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  deleteUser(username, basicConfiguration);
  cy.logout(USER_ADMIN);
}

describe('Account', () => {
  before(() =>  cy.resetEnv('postgres'));
  describe('Create user', () => {
    const userInfo = {
      username: 'christophe',
      email: 'christophe@email.com',
      password: 'MyNewPassword10!!',
      confirmPassword: 'MyNewPassword10!!',
    };

    const adminAccount = {
      admin: USER_ADMIN,
      adminPass: USER_PASS
    }

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

    it('should be possible for an admin to create a new user with all the roles', () => {
      createUserAccount(userInfo, basicConfiguration);
      cy.contains(`L\'utilisateur ${userInfo.username} a été créé avec succès`);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.contains(`${userInfo.username}`).should('be.visible');

      cy.get(`#${userInfo.username} .roles span`)
        .should('be.visible')
        .then(roles => {
          expect(roles).to.have.length(4);
          const firstRole = roles[0].textContent;
          const secondRole = roles[1].textContent;
          const thirdRole = roles[2].textContent;
          const fourthRole = roles[3].textContent;
          expect(firstRole).to.equal('Administrateur inactif');
          expect(secondRole).to.equal('Exploitant inactif');
          expect(thirdRole).to.equal('Sécurité inactif');
          expect(fourthRole).to.equal('Nouvel utilisateur');
        });

      deleteUser(userInfo.username, basicConfiguration);
      cy.logout(USER_ADMIN);
    });

    it('should be possible for an admin to create a new user with only operator role', () => {
      const configuration = Object.assign({}, basicConfiguration, {
        adminRole: false,
        securityRole: false,
      });
      createUserAccount(userInfo, configuration);
      cy.contains(`L\'utilisateur ${userInfo.username} a été créé avec succès`);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.contains(`${userInfo.username}`).should('be.visible');

      cy.get(`#${userInfo.username} .roles span`)
        .should('be.visible')
        .then(roles => {
          expect(roles).to.have.length(2);
          const firstRole = roles[0].textContent;
          const secondRole = roles[1].textContent;
          expect(firstRole).to.equal('Exploitant inactif');
          expect(secondRole).to.equal('Nouvel utilisateur');
        });

      deleteUser(userInfo.username, basicConfiguration);
      cy.logout(USER_ADMIN);
    });

    it('should be possible for an admin to create a new user with only admin role', () => {
      const configuration = Object.assign({}, basicConfiguration, {
        operatorRole: false,
        securityRole: false,
      });
      createUserAccount(userInfo, configuration);
      cy.contains(`L\'utilisateur ${userInfo.username} a été créé avec succès`);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.contains(`${userInfo.username}`).should('be.visible');

      cy.get(`#${userInfo.username} .roles span`)
        .should('be.visible')
        .then(roles => {
          expect(roles).to.have.length(2);
          const firstRole = roles[0].textContent;
          const secondRole = roles[1].textContent;
          expect(firstRole).to.equal('Administrateur inactif');
          expect(secondRole).to.equal('Nouvel utilisateur');
        });

      deleteUser(userInfo.username, basicConfiguration);
      cy.logout(USER_ADMIN);
    });

    it('should be possible for an admin to create a new user with only security role', () => {
      const configuration = Object.assign({}, basicConfiguration, {
        operatorRole: false,
        adminRole: false,
      });
      createUserAccount(userInfo, configuration);
      cy.contains(`L\'utilisateur ${userInfo.username} a été créé avec succès`);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.contains(`${userInfo.username}`).should('be.visible');

      cy.get(`#${userInfo.username} .roles span`)
        .should('be.visible')
        .then(roles => {
          expect(roles).to.have.length(2);
          const firstRole = roles[0].textContent;
          const secondRole = roles[1].textContent;
          expect(firstRole).to.equal('Sécurité inactif');
          expect(secondRole).to.equal('Nouvel utilisateur');
        });

      deleteUser(userInfo.username, basicConfiguration);
      cy.logout(USER_ADMIN);
    });

    it('should not be possible for an admin to create a user with an existing username', () => {
      createUserAccount(userInfo, basicConfiguration);
      createUserAccount(userInfo, basicConfiguration);

      cy.contains("Le nom d'utilisateur est déjà utilisé").should('be.visible');

      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      deleteUser(userInfo.username, basicConfiguration);
      cy.logout(USER_ADMIN);
    });

    it("shouldn't validate the user creation if the csrf token is invalid", () => {
      const configuration = Object.assign({}, basicConfiguration, {
        _csrf: false,
      });
      createUserAccount(userInfo, configuration);

      cy.contains('Error - 500').should('be.visible');

      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.contains(`${userInfo.username}`).should('not.be.visible');
      cy.logout(USER_ADMIN);
    });

    describe('Should fail', () => {
      it('if an error occured in the form, we display errors ( empty fields )', () => {
        const userInfo = {
          username: '',
          email: '',
        };

        const configuration = Object.assign({}, basicConfiguration, {
          adminRole: false,
          operatorRole: false,
          securityRole: false,
          totpNotFilled: true,
        });

        createUserAccount(userInfo, configuration);
        cy.contains(`Le nom d'utilisateur doit être renseigné`).should('be.visible');
        cy.contains(`Veuillez mettre une adresse email valide ( Ex: email@email.com )`).should('be.visible');
        cy.contains(`Veuillez renseigner au moins un rôle`).should('be.visible');
      })

      it('if an error occured in the form, we diplays error (name)', () => {
        const userInfo = {
          username: '',
          email: 'email@email.fr',
        };

        const configuration = Object.assign({}, basicConfiguration, {
          totpNotFilled: true,
        });

        createUserAccount(userInfo, configuration);
        cy.contains(`Le nom d'utilisateur doit être renseigné`).should('be.visible');
      })

      it('if an error occured in the form, we diplays error (email)', () => {
        const userInfo = {
          username: 'username',
          email: '***',
        };

        const configuration = Object.assign({}, basicConfiguration, {
          totpNotFilled: true,
        });

        createUserAccount(userInfo, configuration);
        cy.contains(`Veuillez mettre une adresse email valide ( Ex: email@email.com )`).should('be.visible');
      })

      it('if an error occured in the form, we diplays error (roles)', () => {
        const configuration = Object.assign({}, basicConfiguration, {
          adminRole: false,
          operatorRole: false,
          securityRole: false,
          totpNotFilled: true,
        });

        createUserAccount(userInfo, configuration);
        cy.contains(`Veuillez renseigner au moins un rôle`).should('be.visible');
      })

      it('if the totp is invalid', () => {
        const configuration = Object.assign({}, basicConfiguration, {
          totpNotFilled: true,
        });

        createUserAccount(userInfo, configuration);
        cy.url().should(
          'eq',
          `${BASE_URL}/account/create`,
        );
        cy.contains(`Veuillez mettre un code TOTP valide`).should('be.visible');
      })
    })

    describe('Patch enrollment', () => {
      it('should be possible for the new user to update his password, and type his totp token', () => {
        const configuration = Object.assign({}, basicConfiguration, {
          redirect: false,
          password: 'S:z,s.xS3',
          confirmPassword: 'S:z,s.xS3',
        });
        createUserAndLogWith(userInfo, configuration);

        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        cy.get(`#${userInfo.username} .roles span`)
          .should('be.visible')
          .then(roles => {
            expect(roles).to.have.length(2);
            const firstRole = roles[0].textContent;
            const secondRole = roles[1].textContent;
            expect(firstRole).to.equal('Administrateur');
            expect(secondRole).to.equal('Exploitant');
          });

        logoutAndDeleteUser(userInfo.username, configuration);
      });

      it('Should not be possible for the new user to update his password if he is not respecting password format', () => {
        const configuration = Object.assign({}, basicConfiguration, {
          redirect: false,
          typeEvent: true,
        });
        const user = Object.assign({}, userInfo, { password: 'MyNewPassword10' });
        cy.contains('Comptes utilisateurs').click();
        createUserAndLogWith(user, configuration);

        cy.url().should('contain', `/account/enrollment`);

        cy.get('#password + div > span').then(checkPassword => {
          // use jquery's map to grab all of their classes
          // jquery's map returns a new jquery object
          const classes = checkPassword.map((i, el) => {
            return Cypress.$(el).attr('class');
          });

          // call classes.get() to make this a plain array
          expect(classes.get()).to.deep.eq([
            'fa valid-password',
            'fa valid-password',
            'fa',
            'fa valid-password',
            'fa valid-password',
            'fa valid-password',
          ]);
        });

        logoutAndDeleteUser(userInfo.username, configuration);
      });

      it('Should not be possible for the new user to update his password if he is not respecting confirm password format', () => {
        const configuration = Object.assign({}, basicConfiguration, {
          redirect: false,
          submit: false,
          typeEvent: true,
        });
        const user = Object.assign({}, userInfo, {
          confirmPassword: 'fsfsdfdsf',
        });

        cy.contains('Comptes utilisateurs').click();
        createUserAndLogWith(user, configuration);

        cy.url().should('contain', `/account/enrollment`);
        cy.contains('Les mots de passe ne sont pas les mêmes.').should(
          'be.visible',
        );

        logoutAndDeleteUser(userInfo.username, configuration);
      });

      it('Should not be possible for the new user to update his password if totp is not valid', () => {
        const configuration = Object.assign({}, basicConfiguration, {
          redirect: false,
          totpFirstLogin: false,
        });
        cy.contains('Comptes utilisateurs').click();
        createUserAndLogWith(userInfo, configuration);

        cy.url().should('contain', `/account/enrollment`);
        cy.contains("Le TOTP saisi n'est pas valide").should('be.visible');

        logoutAndDeleteUser(userInfo.username, configuration);
      });

      it("Should throw an error if his password is too short", () => {
        testIsCompliantPasswordEnrollment(
          {...basicConfiguration},
          userInfo,
          {
            password: 'short@Pass1',
            passwordConfirmation:'short@Pass1', 
            errorMessage: 'Le mot de passe saisi est invalide'
          },
          adminAccount
        );
      })

      it("Should throw an error if his password does not contain lowercase letters", () => {
        testIsCompliantPasswordEnrollment(
          {...basicConfiguration},
          userInfo,
          {
            password: 'NO-LOWER@PASS10',
            passwordConfirmation: 'NO-LOWER@PASS10',
            errorMessage: 'Le mot de passe saisi est invalide'
          },
          adminAccount);
      })

      it("Should throw an error if his password does not contain uppercase letters", () => {
        testIsCompliantPasswordEnrollment(
          {...basicConfiguration},
          userInfo,
          {
            password: 'no-upper@pass1',
            passwordConfirmation: 'no-upper@pass1',
            errorMessage: 'Le mot de passe saisi est invalide'
          },
          adminAccount);
      })

      it("Should throw an error if his password does not contain special characters", () => {
        testIsCompliantPasswordEnrollment(
          {...basicConfiguration},
          userInfo,
          {
            password: 'NoSpecialChars123',
            passwordConfirmation: 'NoSpecialChars123',
            errorMessage: 'Le mot de passe saisi est invalide'
          },
          adminAccount);
      })

      it("Should throw an error if his password does not contain numbers", () => {
        testIsCompliantPasswordEnrollment(
          {...basicConfiguration},
          userInfo,
          {
            password: 'NoNumbers@TryAgainBuddy',
            passwordConfirmation: 'NoNumbers@TryAgainBuddy',
            errorMessage: 'Le mot de passe saisi est invalide',
          },
          adminAccount);
      })

      it("Should throw an error if his passwords do not match", () => {
        testIsCompliantPasswordEnrollment(
          {...basicConfiguration},
          userInfo,
          {
            password: 'DoesNotMatch@Buddy10',
            passwordConfirmation: 'NotMatching@Buddy20',
            errorMessage: 'Les mots de passe fournis ne correspondent pas'
          },
          adminAccount);
      });
    });
  });
});
