/// <reference types="Cypress" />
import {
  USER_OPERATOR,
  USER_PASS,
} from '../../../../shared/cypress/support/constants';

import *  as rnippIdentities from '../../../../shared/cypress/fixtures/rnipp-test-identities';

const configuration = {};

const BASE_URL = Cypress.config('baseUrl');

describe('Citizen Management', () => {
  before(() => cy.resetEnv('mongoFC'));
  beforeEach(() => {
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`${BASE_URL}/rnipp`);
  });

  it('Should find a user that is active and has already a connexion to FC', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    const person = {
      supportId: '1234567891234567',
      ...rnippIdentities['utilisateur_français_actif'],
    };
    cy.formFill(person, configuration);

    cy.get('form[name="rnipp-form"] button[type="submit"]').click();

    // Should
    cy.url().should('equal', `${BASE_URL}/research`);
    cy.get('#result').contains('Résultat du redressement RNIPP');
    cy.get('#result > .card > .card-body > div.mb-2 > div.font-weight-bold').should($divs => {
      // Expect
      expect($divs).to.have.length(8);
      expect($divs.eq(0)).to.contain('1234567891234567');
      expect($divs.eq(1)).to.contain('Masculin');
      expect($divs.eq(2)).to.contain('NORRIS');
      expect($divs.eq(3)).to.contain('');
      expect($divs.eq(4)).to.contain('Chuck');
      expect($divs.eq(5)).to.contain('0001-01-01');
      expect($divs.eq(6)).to.contain('00000');
      expect($divs.eq(7)).to.contain('99100');
    });

    cy.formControl({ ...person, familyName: 'NORRIS' });

    // Wait for the status to be fetched from database
    cy.get('#citizen-status ul li:first span', { timeout: 2000 }).should('have.class', 'badge-success');
    cy.contains('Dernière connexion : le 08/01/2020 à 15:33:26');
    cy.get('#citizen-status', { timeout: 2000 }).should('not.contain', 'Identity Hash :');
  });


  it('Should find a user that is desactivated and has never connect to FC', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    const person = {
      supportId: '1234567891234567',
      ...rnippIdentities['utilisateur_étranger_désactivé_jamais_connecté'],
    };
    cy.formFill(person, configuration);

    cy.get('form[name="rnipp-form"] button[type="submit"]').click();

    // Should
    cy.url().should('equal', `${BASE_URL}/research`);
    cy.get('#result').contains('Résultat du redressement RNIPP');
    cy.get('#result > .card > .card-body > div.mb-2 > div.font-weight-bold').should($divs => {
      // Expect
      expect($divs).to.have.length(8);
      expect($divs.eq(0)).to.contain('1234567891234567');
      expect($divs.eq(1)).to.contain('Masculin');
      expect($divs.eq(2)).to.contain('FLEURET');
      expect($divs.eq(3)).to.contain('');
      expect($divs.eq(4)).to.contain('Jean');
      expect($divs.eq(5)).to.contain('2019-11-15');
      expect($divs.eq(6)).to.contain('');
      expect($divs.eq(7)).to.contain('99217');
    });

    cy.formControl({ ...person });

    // Wait for the status to be fetched from database
    cy.get('#citizen-status ul li:first span', { timeout: 2000 }).should('have.class', 'badge-danger');
    cy.contains('Dernière connexion : Jamais');
    cy.get('#citizen-status', { timeout: 2000 }).should('not.contain', 'Identity Hash :');
  });
});