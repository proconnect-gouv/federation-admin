import { createUserAndLogWith, deleteUserAndLogout } from '../integration/account/account-create.util'
import { USER_ADMIN } from './constants';

export function testIsCompliantPasswordUpdate(basicConfiguration, request) {
    cy.contains(USER_ADMIN).click();
    cy.contains('Mon compte').click();

    cy.get('#secret > td').then(async secret => {
      await cy.totp(basicConfiguration, secret[0].textContent);
    })

    cy.get('input[name="_totp"]').invoke('val').then(totp => {
      cy.get('input[name="_csrf"]').invoke('val').then(csrf => {
        cy.request({
          method: 'POST',
          url : `/account/update-account/jean_moust?_method=PATCH`,
          form: true,
          body: {
            currentPassword: 'georgesmoustaki',
            password: request.password,
            passwordConfirmation: request.passwordConfirmation,
            _csrf: csrf,
            _totp: totp,
          },
        }).its('body').should('include', request.errorMessage);
        cy.visit(`/logout`);
      });
    });
}

export function testIsCompliantPasswordEnrollment (basicConfiguration, userInfo, request, adminAccount) {
    const configuration = Object.assign({}, basicConfiguration, { submit: false });
    cy.contains('Comptes utilisateurs').click();

    createUserAndLogWith(userInfo, configuration);
    
    cy.get('input[name="_totp"]').invoke('val').then(totp => {
      cy.get('input[name="_csrf"]').invoke('val').then(csrf => {
        cy.request({
          method: 'POST', 
          url: `/account/enrollment/?_method=PATCH`,
          form: true, 
          body: {
            password: request.password,
            passwordConfirmation: request.passwordConfirmation,
            _csrf: csrf,
            _totp: totp,
          },
        }).its('body').should('include', request.errorMessage);
        cy.visit(`/logout`);
        deleteUserAndLogout(adminAccount, userInfo.username, basicConfiguration); 
      });
    });
}