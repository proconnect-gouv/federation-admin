/// <reference types="Cypress" />

const FC_SUPPORT_LOGIN_URL = 'https://support.docker.dev-franceconnect.fr/login';
const FC_SUPPORT_RNIPP_URL = 'https://support.docker.dev-franceconnect.fr/rnipp';
const FC_SUPPORT_SEARCH_URL = 'https://support.docker.dev-franceconnect.fr/research';

describe('RnippController', () => {
  beforeEach(() => {
    cy.visit(FC_SUPPORT_LOGIN_URL);
    cy.get('input[name=username]')
      .clear()
      .type('jean_moust');
    cy.get('input[name=password]')
      .clear()
      .type('georgesmoustaki');
    cy.get('button[type=submit]').click();
  });

  it('Should retrieve userinfo from RNIPP (person who is born in France)', () => {
    cy.url().should('equal', `${FC_SUPPORT_RNIPP_URL}`);
    cy.contains('Rechercher un usager');

    // Fill in form
    cy.get('input[name=supportId]')
      .clear()
      .type('1234567891234567');
    cy.get('input[name=gender]')
        .check('male', { force: true });
    cy.get('input[name=familyName]')
      .clear()
      .type('Jack');
    cy.get('input[name=preferredUsername]')
      .clear();
    cy.get('input[name=givenName]')
      .clear()
      .type('Pierre Paul');
    cy.get('input[name=birthdate]')
      .clear()
      .type('1990-11-12');
    cy.get('body')
      .click('topRight');
    cy.get('input[name=birthPlace]')
      .clear()
      .type('92012');
    cy.get('form[name="rnipp-form"] button[type="submit"]')
      .click();

    // Should
    cy.url().should('equal', `${FC_SUPPORT_SEARCH_URL}`);
    cy.get('#result').contains('Résultat du redressement RNIPP');
    cy.get('#result > .card > .card-body > div.mb-2').should(($divs) => {
      // Expect
      expect($divs).to.have.length(8)
      expect($divs.eq(0)).to.contain('Masculin')
      expect($divs.eq(1)).to.contain('JACK');
      expect($divs.eq(3)).to.contain('Pierre Paul');
      expect($divs.eq(4)).to.contain('1990-11-12');
      expect($divs.eq(5)).to.contain('92012');
      expect($divs.eq(6)).to.contain('99100');
    });

    cy.get('input[name=supportId]').should('have.value', '1234567891234567');
    cy.get('input[name=gender]').should('be.checked');
    cy.get('input[name=familyName]').should('have.value', 'Jack');
    cy.get('input[name=givenName]').should('have.value', 'Pierre Paul');
    cy.get('input[name=birthdate]').should('have.value', '1990-11-12');
    cy.get('input[name=birthCountry]').should('be.checked');
    cy.get('input[name=birthPlace]').should('have.value', '92012');
  });

  it('Should retrieve userinfo with accented character and ç from RNIPP (person who is born in France)', () => {
    cy.url().should('equal', `${FC_SUPPORT_RNIPP_URL}`);
    cy.contains('Rechercher un usager');

    // Fill in form
    cy.get('input[name=supportId]')
      .clear()
      .type('1234567891234567');
    cy.get('input[name=gender]')
      .check('male', { force: true });
    cy.get('input[name=familyName]')
      .clear()
      .type('Jack');
    cy.get('input[name=preferredUsername]')
      .clear();
    cy.get('input[name=givenName]')
      .clear()
      .type('René Françoise');
    cy.get('input[name=birthdate]')
      .clear()
      .type('1990-11-12');
    cy.get('body')
      .click('topRight');
    cy.get('input[name=birthPlace]')
      .clear()
      .type('92012');
    cy.get('form[name="rnipp-form"] button[type="submit"]')
      .click();

    // Should
    cy.url().should('equal', `${FC_SUPPORT_SEARCH_URL}`);
    cy.get('#result').contains('Résultat du redressement RNIPP');
    cy.get('#result > .card > .card-body > div.mb-2').should(($divs) => {
      // Expect
      expect($divs).to.have.length(8)
      expect($divs.eq(0)).to.contain('Masculin')
      expect($divs.eq(1)).to.contain('JACK');
      expect($divs.eq(3)).to.contain('René Françoise');
      expect($divs.eq(4)).to.contain('1990-11-12');
      expect($divs.eq(5)).to.contain('92012');
      expect($divs.eq(6)).to.contain('99100');
    });

    cy.get('input[name=supportId]').should('have.value', '1234567891234567');
    cy.get('[type="radio"]').should('be.checked');
    cy.get('input[name=familyName]').should('have.value', 'Jack');
    cy.get('input[name=givenName]').should('have.value', 'René Françoise');
    cy.get('input[name=birthdate]').should('have.value', '1990-11-12');
    cy.get('input[name=birthCountry]').should('be.checked');
    cy.get('input[name=birthPlace]').should('have.value', '92012');
  });

  it('Should retrieve userinfo from RNIPP (person who is not born in France)', () => {
    cy.url().should('equal', `${FC_SUPPORT_RNIPP_URL}`);
    cy.contains('Rechercher un usager');

    // Fill in form
    cy.get('input[name=supportId]')
      .clear()
      .type('1234567891234567');
    cy.get('input[name=gender]')
      .check('male', { force: true });
    cy.get('input[name=familyName]')
      .clear()
      .type('Jack');
    cy.get('input[name=preferredUsername]')
      .clear();
    cy.get('input[name=givenName]')
      .clear()
      .type('Pierre Paul');
    cy.get('input[name=birthdate]')
      .clear()
      .type('1990-11-12');
    cy.get('body')
      .click('topRight');
    cy.get('input[name=birthCountry]')
      .check('99999', { force: true });
    cy.get('input[name=birthPlace]')
      .clear()
      .type('99350');
    cy.get('form[name="rnipp-form"] button[type="submit"]')
      .click();

    // Should
    cy.url().should('equal', `${FC_SUPPORT_SEARCH_URL}`);
    cy.get('#result').contains('Résultat du redressement RNIPP');
    cy.get('#result > .card > .card-body > div.mb-2').should(($divs) => {
      // Expect
      expect($divs).to.have.length(8)
      expect($divs.eq(0)).to.contain('Masculin')
      expect($divs.eq(1)).to.contain('JACK');
      expect($divs.eq(3)).to.contain('Pierre Paul');
      expect($divs.eq(4)).to.contain('1990-11-12');
      expect($divs.eq(5)).to.contain('');
      expect($divs.eq(6)).to.contain('99350');
    });

    cy.get('input[name=supportId]').should('have.value', '1234567891234567');
    cy.get('input[name=gender]').should('be.checked');
    cy.get('input[name=familyName]').should('have.value', 'Jack');
    cy.get('input[name=givenName]').should('have.value', 'Pierre Paul');
    cy.get('input[name=birthdate]').should('have.value', '1990-11-12');
    cy.get('input[name=birthCountry]').should('be.checked');
    cy.get('input[name=birthPlace]').should('have.value', '99350');
  });

  it('Should not send the form if require input are empty', () => {
    cy.url().should('equal', `${FC_SUPPORT_RNIPP_URL}`);
    cy.contains('Rechercher un usager');

    // Clear all input form
    cy.get('input[name=supportId]')
      .clear();
    cy.get('input[name=familyName]')
      .clear();
    cy.get('input[name=preferredUsername]')
      .clear();
    cy.get('input[name=givenName]')
      .clear();
    cy.get('input[name=birthdate]')
      .clear();
    cy.get('body')
      .click('topRight');
    cy.get('input[name=birthPlace]')
      .clear();
    cy.get('form[name="rnipp-form"] button[type="submit"]')
      .click();

    // Should
    cy.contains('Veuillez renseigner le numéro de ticket support').should('be.visible');
    cy.contains('Vous devez choisir un genre').should('be.visible');
    cy.contains('Veuillez renseigner un nom de famille').should('be.visible');
    cy.contains('Veuillez renseigner un prénom ou vos prénoms').should('be.visible');
    cy.contains('Veuillez renseigner une date au format YYY-mm-dd').should('be.visible');
    cy.contains('Veuillez renseigner le COG du lieu de naissance').should('be.visible');
  });

  it('Should not send the form if require input are empty and keep value already fill in', () => {
    cy.url().should('equal', `${FC_SUPPORT_RNIPP_URL}`);
    cy.contains('Rechercher un usager');

    // Clear all input form
    cy.get('input[name=supportId]')
      .clear();
    cy.get('input[name=familyName]')
      .clear()
      .type('Jack');
    cy.get('input[name=preferredUsername]')
      .clear();
    cy.get('input[name=givenName]')
      .clear();
    cy.get('input[name=birthdate]')
      .clear()
      .type('1990-11-12');
    cy.get('body')
      .click('topRight');
    cy.get('input[name=birthPlace]')
      .clear();
    cy.get('form[name="rnipp-form"] button[type="submit"]')
      .click();

    // Should
    cy.contains('Veuillez renseigner le numéro de ticket support').should('be.visible');
    cy.contains('Vous devez choisir un genre').should('be.visible');
    cy.contains('Veuillez renseigner un prénom ou vos prénoms').should('be.visible');
    cy.contains('Veuillez renseigner le COG du lieu de naissance').should('be.visible');
    cy.get('input[name=familyName]').should('have.value', 'Jack');
    cy.get('input[name=birthdate]').should('have.value', '1990-11-12');
    cy.get('input[name=birthCountry]').should('be.checked');
  });
});
