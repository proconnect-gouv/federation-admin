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

describe('Metrics visualisation UI', () => {
  before(() => {
    cy.resetEnv('elasticStats');
  });

  beforeEach(() => {
    cy.login(USER_OPERATOR, USER_PASS);
  });

  it('displays the metric page with', () => {
    cy.contains('Choisissez des dates');
  });

  it('displays the metric page with result when data range is choosed', () => {
    cy.visit(`/metrics?start=${START}&stop=${STOP}&visualize=list`);
    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
  });

  it('displays the metric page with result when data filter key is choosed', () => {
    cy.visit(
      `/metrics?start=${START}&stop=${STOP}&filters%5B%5D=key%3Aaccount&visualize=list`,
    );
    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
    cy.get('tbody td')
      .first()
      .should('contain', 'Comptes');
    cy.get('tbody tr:last td')
      .first()
      .should('contain', 'Comptes');
  });

  it('displays the metric page with result when another filter key is choosed', () => {
    cy.visit(
      `/metrics?start=${START}&stop=${STOP}&filters%5B%5D=key%3Adisabled&visualize=list`,
    );
    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
    cy.get('tbody td')
      .first()
      .should('contain', 'Comptes désactivés');
    cy.get('tbody tr:last td')
      .first()
      .should('contain', 'Comptes désactivés');
  });

  it('displays the metric page with result only with choosen granularity', () => {
    cy.visit(
      `/metrics?start=${START}&stop=${STOP}&filters%5B%5D=key%3Adisabled&visualize=list&filters[]=range:week`,
    );
    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
    cy.get('tbody th').each($th => {
      cy.wrap($th).should('contain', 'du ');
      cy.wrap($th).should('contain', 'au ');
    });
  });

  it('displays bar chart page without JS error', () => {
    cy.visit(
      `/metrics?start=${START}&stop=${STOP}&visualize=bar&filters[]=range:week&x=date&y=fs`,
    );
    cy.get('canvas[data-type=bar]');
  });

  it('displays line chart page without JS error', () => {
    cy.visit(
      `/metrics?start=${START}&stop=${STOP}&visualize=line&filters[]=range:week&x=date&y=fs`,
    );
    cy.get('canvas[data-type=line]');
  });

  it('displays pie chart page without JS error', () => {
    cy.visit(
      `/metrics?start=${START}&stop=${STOP}&visualize=pie&filters[]=range:week&x=date&y=fs`,
    );
    cy.get('canvas[data-type=pie]');
  });

  it('Checks the choosen values in dropdowns', () => {
    cy.visit(
      `/metrics?start=${START}&stop=${STOP}&visualize=pie&filters[]=key:account&filters[]=key:disabled&filters[]=range:week&x=date&y=key`,
    );
    cy.get('#key-dropdown input[id="filters[]key:account"]').should(
      'be.checked',
    );
    cy.get('#key-dropdown input[id="filters[]key:disabled"]').should(
      'be.checked',
    );
    cy.get('#key-dropdown input[id="filters[]key:activeAccount"]').should(
      'not.be.checked',
    );

    cy.get('#visualize-dropdown input[id="visualizelist"]').should(
      'not.be.checked',
    );
    cy.get('#visualize-dropdown input[id="visualizebar"]').should(
      'not.be.checked',
    );
    cy.get('#visualize-dropdown input[id="visualizeline"]').should(
      'not.be.checked',
    );
    cy.get('#visualize-dropdown input[id="visualizepie"]').should('be.checked');

    cy.get('#range-dropdown input[id="filters[]range:day"]').should(
      'not.be.checked',
    );
    cy.get('#range-dropdown input[id="filters[]range:week"]').should(
      'be.checked',
    );
    cy.get('#range-dropdown input[id="filters[]range:month"]').should(
      'not.be.checked',
    );
    cy.get('#range-dropdown input[id="filters[]range:year"]').should(
      'not.be.checked',
    );

    cy.get('input[name="y"]').should('have.value', 'key');
  });

  it('UI controls are working', () => {
    cy.visit(`/metrics`);

    cy.get('#start').click();
    cy.get('.lightpick__day:first').click();
    cy.get('.lightpick__day:last').click();

    cy.get('#bouton-filtrer').click();

    cy.get('#key-dropdown button').click();
    cy.get('#key-dropdown label[for="filters[]key:account"]').click();

    cy.get('#bouton-filtrer').click();

    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
    cy.get('tbody td')
      .first()
      .should('contain', 'Comptes');
    cy.get('tbody tr:last td')
      .first()
      .should('contain', 'Comptes');

    cy.get('#visualize-dropdown button').click();
    cy.get('#visualize-dropdown label[for="visualizeline"]').click();
    cy.get('#bouton-filtrer').click();

    cy.get('canvas[data-type="line"]');
  });
});
