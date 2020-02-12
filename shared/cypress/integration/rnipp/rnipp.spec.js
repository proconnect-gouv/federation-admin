/// <reference types="Cypress" />
import {
  USER_OPERATOR,
  USER_PASS,
} from '../../support/constants';

import *  as rnippIdentities from '../../fixtures/rnipp-test-identities';

const configuration = {};

const BASE_URL = Cypress.config('baseUrl');

describe('Rnipp rectification', () => {
  before(() => cy.resetEnv('mongoFC'));
  beforeEach(() => {
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`${BASE_URL}/rnipp`);
  });

  it('Should retrieve userinfo from RNIPP (person who is born in France)', () => {
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

    cy.formControl({ ...person });
  });

  it('Should retrieve userinfo with accented character and ç from RNIPP (person who is born in France)', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');
    const person = {
      supportId: '1234567891234567',
      ...rnippIdentities['utilisateur_français_actif_caractère_spéciaux'],
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
      expect($divs.eq(2)).to.contain('LE FRANÇAIS');
      expect($divs.eq(3)).to.contain('');
      expect($divs.eq(4)).to.contain('François');
      expect($divs.eq(5)).to.contain('0001-01-01');
      expect($divs.eq(6)).to.contain('00000');
      expect($divs.eq(7)).to.contain('99100');
    });

    cy.formControl({ ...person });
  });

  it('Should retrieve userinfo from RNIPP (person who is not born in France)', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    const person = {
      supportId: '1234567891234567',
      ...rnippIdentities['utilisateur_étranger_actif'],
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
      expect($divs.eq(2)).to.contain('TARGE');
      expect($divs.eq(3)).to.contain('');
      expect($divs.eq(4)).to.contain('Jean');
      expect($divs.eq(5)).to.contain('2019-11-15');
      expect($divs.eq(6)).to.contain('');
      expect($divs.eq(7)).to.contain('99217');
    });

    cy.formControl({ ...person });
  });

  it('Should retrieve userinfo from RNIPP (person from whom we do not know month and day of birth)', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    const person = {
      supportId: '1234567891234567',
      ...rnippIdentities['utilisateur_dont_on_ne_connaît_pas_le_mois_et_le_jour_de_naissance'],
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
      expect($divs.eq(5)).to.contain('2019-00-00');
      expect($divs.eq(6)).to.contain('');
      expect($divs.eq(7)).to.contain('99217');
    });

    cy.formControl(person);
  });

  it('Should retrieve userinfo from RNIPP (person from whom we do not know day of birth)', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    const person = {
      supportId: '1234567891234567',
      ...rnippIdentities['utilisateur_dont_on_ne_connaît_pas_le_jour_de_naissance'],
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
      expect($divs.eq(5)).to.contain('2019-11-00');
      expect($divs.eq(6)).to.contain('');
      expect($divs.eq(7)).to.contain('99217');
    });

    cy.formControl(person);
  });

  it('Should retrieve userinfo rectified from RNIPP', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

    const person = {
      supportId: '1234567891234567',
      ...rnippIdentities['utilisateur_français_actif_à_redresser'],
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
  });

  describe('Dead people', () => {
    it('Should retrieve userinfo from RNIPP (man who died)', () => {
      cy.url().should('equal', `${BASE_URL}/rnipp`);
      cy.contains('Rechercher un usager');
  
      const person = {
        supportId: '1234567891234567',
        ...rnippIdentities['utilisateur_masculin_décédé'],
      };
  
      cy.formFill(person, configuration);
  
      cy.get('form[name="rnipp-form"] button[type="submit"]').click();
  
      // Should
      cy.url().should('equal', `${BASE_URL}/research`);
      cy.get('#result').contains('Résultat du redressement RNIPP');
      cy.get('#dead').contains("L'utilisateur est déclaré décédé. Aucune autre information n'est disponible.");
      cy.get('#result > .card > .card-body > div.mb-2 > div.font-weight-bold').should($divs => {
        // Expect
        expect($divs).to.have.length(8);
        expect($divs.eq(0)).to.contain('1234567891234567');
        expect($divs.eq(1)).to.contain('Masculin');
        expect($divs.eq(2)).to.contain('BEREGOVOY');
        expect($divs.eq(3)).to.contain('');
        expect($divs.eq(4)).to.contain('Pierre');
        expect($divs.eq(5)).to.contain('1925-12-23');
        expect($divs.eq(6)).to.contain('76216');
        expect($divs.eq(7)).to.contain('99100');
      });
  
      cy.formControl({ ...person });
    });

    it('Should retrieve userinfo from RNIPP (woman who died)', () => {
      cy.url().should('equal', `${BASE_URL}/rnipp`);
      cy.contains('Rechercher un usager');
  
      const person = {
        supportId: '1234567891234567',
        ...rnippIdentities['utilisateur_féminin_décédée'],
      };
  
      cy.formFill(person, configuration);
  
      cy.get('form[name="rnipp-form"] button[type="submit"]').click();
  
      // Should
      cy.url().should('equal', `${BASE_URL}/research`);
      cy.get('#result').contains('Résultat du redressement RNIPP');
      cy.get('#dead').contains("L'utilisatrice est déclarée décédée. Aucune autre information n'est disponible.");
      cy.get('#result > .card > .card-body > div.mb-2 > div.font-weight-bold').should($divs => {
        // Expect
        expect($divs).to.have.length(8);
        expect($divs.eq(0)).to.contain('1234567891234567');
        expect($divs.eq(1)).to.contain('Féminin');
        expect($divs.eq(2)).to.contain('VEIL');
        expect($divs.eq(3)).to.contain('');
        expect($divs.eq(4)).to.contain('Simone');
        expect($divs.eq(5)).to.contain('1927-07-13');
        expect($divs.eq(6)).to.contain('06000');
        expect($divs.eq(7)).to.contain('99100');
      });
  
      cy.formControl({ ...person });
    });
  });

  it('Should not send the form if require input are empty', () => {
    cy.url().should('equal', `${BASE_URL}/rnipp`);
    cy.contains('Rechercher un usager');

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
    cy.get('input[name=isFrench]').should('be.checked');
  });
});
