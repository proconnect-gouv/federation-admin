import moment from 'moment';
import {
  USER_OPERATOR,
  USER_PASS,
} from '../../../../shared/cypress/support/constants';

const START = moment()
  .add(-3, 'month')
  .format('YYYY-MM-DD');
const STOP = moment()
  .add(3, 'month')
  .format('YYYY-MM-DD');

describe('Events visualisation UI', () => {
  before(() => {
    cy.resetEnv('events');
  });

  beforeEach(() => {
    cy.login(USER_OPERATOR, USER_PASS);
  });

  it('should have connexion checked by default within action dropdown', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=list&granularity=month&x=date&y=fs`,
    );

    cy.get('#action-dropdown').within(() => {
      cy.get('button').click();
      cy.get('label[for="filters[]action:authentication"]').prev('input').should('be.checked');
    });
  });

  it('searches type actions by label and not technical terms', () => {
    const searchString1 = 'demande';
    const searchString2 = 'erreur';
    const searchString3 = 'tentative';
    const searchString4 = 'consentement';
    const searchString5 = 'naissance';
    const searchString6 = 'token';
    const searchString7 = 'url';
    const searchString8 = 'scope';

    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=list&granularity=month&x=date&y=fs`,
    );

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('input[type=text]').type(searchString1);
      cy.get('.dropdown-item').should('have.length', 10);
      cy.get('input[type=text]').clear();
      cy.get('input[type=text]').type(searchString2);
      cy.get('.dropdown-item').should('have.length', 4);
      cy.get('input[type=text]').clear();
      cy.get('input[type=text]').type(searchString3);
      cy.get('.dropdown-item').should('have.length', 3);
      cy.get('input[type=text]').clear();
      cy.get('input[type=text]').type(searchString4);
      cy.get('.dropdown-item').should('have.length', 3);
      cy.get('input[type=text]').clear();
      cy.get('input[type=text]').type(searchString5);
      cy.get('.dropdown-item').should('have.length', 1);
      cy.get('input[type=text]').clear();
      cy.get('input[type=text]').type(searchString6);
      cy.get('.dropdown-item').should('have.length', 1);
      cy.get('input[type=text]').clear();
      cy.get('input[type=text]').type(searchString7);
      cy.get('.dropdown-item').should('have.length', 2);
      cy.get('input[type=text]').clear();
      cy.get('input[type=text]').type(searchString8);
      cy.get('.dropdown-item').should('have.length', 1);
      cy.get('input[type=text]').clear();
    });
  })

  it('displays the events page with', () => {
    cy.visit('/events');
    cy.contains('Choisissez des dates');
  });

  it('displays the events page with result when data range is choosed', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=list&granularity=month&x=date&y=fs`,
    );
    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
  });

  it('displays the events page with result when data filter fi is choosed', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&filters%5B%5D=fi%3Adgfip&visualize=list&granularity=month&x=date&y=fs`,
    );
    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
    cy.get('tbody td')
      .first()
      .should('contain', 'dgfip');
    cy.get('tbody tr:last td')
      .first()
      .should('contain', 'dgfip');
  });

  it('displays the events page with result when another filter fi is choosed', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&filters%5B%5D=fi%3Aameli&visualize=list&granularity=month&x=date&y=fs`,
    );
    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
    cy.get('tbody td')
      .first()
      .should('contain', 'ameli');
    cy.get('tbody tr:last td')
      .first()
      .should('contain', 'ameli');
  });

  it('display first ten elements "Types Actions" in dropdown', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=list&granularity=month&x=date&y=fs`,
    );
    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('.dropdown-item').should('have.length', 10);
    });
  });

  it('display elements "Types actions" that match with search', () => {
    const searchString1 = 'iden';
    const searchString2 = 'div';

    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=list&granularity=month&x=date&y=fs`,
    );

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('input[type=text]').type(searchString1);
      cy.get('.dropdown-item').should('have.length', 8);
      cy.get('input[type=text]').clear();
      cy.get('input[type=text]').type(searchString2);
      cy.get('.dropdown-item').should('have.length', 3);
    });
  });

  it('display elements "Types actions" checked even after a search', () => {
    const searchString = 'iden';
    
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=list&granularity=month&x=date&y=fs`,
    );

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('.dropdown-item').eq(1).click();
      cy.get('input[type=text]').type(searchString);
      cy.get('.dropdown-item').eq(1).click();
      cy.get('input[type=text]').clear();
      cy.get('.dropdown-item').eq(0).children('input').should('be.checked');
      cy.get('.dropdown-item').eq(1).children('input').should('be.checked');
    });
  });

  it('displays bar chart page without JS error', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=bar&granularity=month&x=date&y=fs`,
    );
    cy.get('canvas[data-type=bar]');
  });

  it('displays line chart page without JS error', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=line&granularity=month&x=date&y=fs`,
    );
    cy.get('canvas[data-type=line]');
  });

  it('displays pie chart page without JS error', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=pie&granularity=month&x=date&y=fs`,
    );
    cy.get('canvas[data-type=pie]');
  });

  it('UI controls are working', () => {
    cy.visit(`/events`);

    cy.get('#start').click();
    cy.get('.lightpick__day:first').click();
    cy.get('.lightpick__day:last').click();

    cy.get('#bouton-filtrer').click();

    cy.get('#fi-dropdown button').click();
    cy.get('#fi-dropdown label[for="filters[]fi:AliceM"]').click();

    cy.get('#bouton-filtrer').click();

    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
    cy.get('tbody td')
      .first()
      .should('contain', 'AliceM');
    cy.get('tbody tr:last td')
      .first()
      .should('contain', 'AliceM');

    cy.get('#visualize-dropdown button').click();
    cy.get('#visualize-dropdown label[for="visualizeline"]').click();
    cy.get('#bouton-filtrer').click();

    cy.get('canvas[data-type="line"]');
  });

  it('Checks the chosen values in dropdowns', () => {
    cy.visit(
      `/events?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&filters%5B%5D=fi%3Adgfip&filters%5B%5D=fi%3Aameli&visualize=bar&granularity=month&x=date&y=fs`,
    );

    cy.get('#fi-dropdown input[id="filters[]fi:ameli"]').should('be.checked');
    cy.get('#fi-dropdown input[id="filters[]fi:dgfip"]').should('be.checked');
    cy.get('#fi-dropdown input[id="filters[]fi:AliceM"]').should(
      'not.be.checked',
    );

    cy.get('#visualize-dropdown input[id="visualizelist"]').should(
      'not.be.checked',
    );
    cy.get('#visualize-dropdown input[id="visualizebar"]').should('be.checked');
    cy.get('#visualize-dropdown input[id="visualizeline"]').should(
      'not.be.checked',
    );
    cy.get('#visualize-dropdown input[id="visualizepie"]').should(
      'not.be.checked',
    );

    cy.get('#granularity-dropdown input[id="granularityweek"]').should(
      'not.be.checked',
    );
    cy.get('#granularity-dropdown input[id="granularitymonth"]').should(
      'be.checked',
    );
    cy.get('#granularity-dropdown input[id="granularityyear"]').should(
      'not.be.checked',
    );

    cy.get('#y-dropdown input[id="ydate"]').should('not.be.checked');
    cy.get('#y-dropdown input[id="yfi"]').should('not.be.checked');
    cy.get('#y-dropdown input[id="yfs"]').should('be.checked');
    cy.get('#y-dropdown input[id="yaction"]').should('not.be.checked');
    cy.get('#y-dropdown input[id="ytypeAction"]').should('not.be.checked');
  });
});
