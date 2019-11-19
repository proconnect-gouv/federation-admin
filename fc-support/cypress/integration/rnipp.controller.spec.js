/// <reference types="Cypress" />
import {
  USER_OPERATOR,
  USER_PASS,
} from '../../../shared/cypress/support/constants';

const configuration = {};

const BASE_URL = Cypress.config('baseUrl');

describe('RnippController', () => {
  beforeEach(() => {
    cy.login(USER_OPERATOR, USER_PASS);
  });

  it('Should retrieve userinfo from RNIPP (person who is born in France)', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    const person = {
      supportId: '1234567891234567',
      familyName: 'Jack',
      givenName: 'Pierre Paul',
      birthdate: '1990-11-12',
      birthPlace: '92012',
    };

    cy.formFill(person, configuration);

    cy.get('input[name=gender]').check('female', { force: true });
    cy.get('form[name="rnipp-form"] button[type="submit"]').click();

    // Should
    cy.url().should('equal', `${BASE_URL}/research`);
    cy.get('#result').contains('Résultat du redressement RNIPP');
    cy.get('#result > .card > .card-body > div.mb-2').should($divs => {
      // Expect
      expect($divs).to.have.length(8);
      expect($divs.eq(0)).to.contain('Féminin');
      expect($divs.eq(1)).to.contain('JACK');
      expect($divs.eq(6)).to.contain('99100');
    });

    cy.formControl({ ...person, familyName: 'JACK' });
  });

  it('Should retrieve userinfo with accented character and ç from RNIPP (person who is born in France)', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');
    const person = {
      supportId: '1234567891234567',
      familyName: 'Jack',
      givenName: 'René Françoise',
      birthdate: '1990-11-12',
      birthPlace: '92012',
    };
    cy.formFill(person, configuration);
    cy.get('input[name=gender]').check('female', { force: true });
    cy.get('form[name="rnipp-form"] button[type="submit"]').click();

    // Should
    cy.url().should('equal', `${BASE_URL}/research`);
    cy.get('#result').contains('Résultat du redressement RNIPP');
    cy.get('#result > .card > .card-body > div.mb-2').should($divs => {
      // Expect
      expect($divs).to.have.length(8);
      expect($divs.eq(0)).to.contain('Féminin');
      expect($divs.eq(1)).to.contain('JACK');
      expect($divs.eq(3)).to.contain('René Françoise');
      expect($divs.eq(4)).to.contain('1990-11-12');
      expect($divs.eq(5)).to.contain('92012');
      expect($divs.eq(6)).to.contain('99100');
    });

    cy.formControl({ ...person, familyName: 'JACK' });
  });

  it('Should retrieve userinfo from RNIPP (person who is not born in France)', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    const person = {
      supportId: '1234567891234567',
      familyName: 'Jack',
      givenName: 'Pierre Paul',
      birthdate: '1990-11-12',
    };
    cy.formFill(person, configuration);

    cy.get('input[name=gender]').check('female', { force: true });
    cy.get('input[name=birthCountry]').check('99999', { force: true });
    cy.formType('[name="birthPlace"]', '99350');
    cy.get('form[name="rnipp-form"] button[type="submit"]').click();

    // Should
    cy.url().should('equal', `${BASE_URL}/research`);
    cy.get('#result').contains('Résultat du redressement RNIPP');
    cy.get('#result > .card > .card-body > div.mb-2').should($divs => {
      // Expect
      expect($divs).to.have.length(8);
      expect($divs.eq(0)).to.contain('Féminin');
      expect($divs.eq(1)).to.contain('JACK');
      expect($divs.eq(3)).to.contain('Pierre Paul');
      expect($divs.eq(4)).to.contain('1990-11-12');
      expect($divs.eq(5)).to.contain('');
      expect($divs.eq(6)).to.contain('99350');
    });

    cy.formControl({ ...person, familyName: 'JACK' });
  });

  it('Should not send the form if require input are empty', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    // Clear all input form
    cy.get('input[name=supportId]').clear();
    cy.get('input[name=familyName]').clear();
    cy.get('input[name=preferredUsername]').clear();
    cy.get('input[name=givenName]').clear();
    cy.get('input[name=birthdate]').clear();
    cy.get('body').click('topRight');
    cy.get('input[name=birthPlace]').clear();
    cy.get('form[name="rnipp-form"] button[type="submit"]').click();

    // Should
    cy.contains(
      'Veuillez renseigner un numéro de ticket valide (16 chiffres)',
    ).should('be.visible');
    cy.contains('Vous devez choisir un genre').should('be.visible');
    cy.contains('Veuillez renseigner un nom de famille').should('be.visible');
    cy.contains('Veuillez renseigner un prénom ou vos prénoms').should(
      'be.visible',
    );
    cy.contains('Veuillez renseigner une date au format YYY-mm-dd').should(
      'be.visible',
    );
    cy.contains('Veuillez renseigner le COG du lieu de naissance').should(
      'be.visible',
    );
  });

  it('Should not send the form if require input are empty and keep value already fill in', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    cy.formFill(
      {
        familyName: 'Jack',
        birthdate: '1990-11-12',
      },
      configuration,
    );

    cy.get('form[name="rnipp-form"] button[type="submit"]').click();

    // Should
    cy.contains(
      'Veuillez renseigner un numéro de ticket valide (16 chiffres)',
    ).should('be.visible');
    cy.contains('Vous devez choisir un genre').should('be.visible');
    cy.contains('Veuillez renseigner un prénom ou vos prénoms').should(
      'be.visible',
    );
    cy.contains('Veuillez renseigner le COG du lieu de naissance').should(
      'be.visible',
    );
    cy.get('input[name=familyName]').should('have.value', 'Jack');
    cy.get('input[name=birthdate]').should('have.value', '1990-11-12');
    cy.get('input[name=birthCountry]').should('be.checked');
  });
});
