import moment from 'moment';
import qs from 'qs';
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
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": "action:authentication",
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('#action-dropdown').within(() => {
      cy.get('button').click();
      cy.get('label[for="filters[]action:authentication"]').prev('input').should('be.checked');
    });
  });

  it('searches type actions by label and not technical terms', () => {
    const searchString1 = 'Demande';

    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": "action:authentication",
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('input[type=text]').type(searchString1);
      cy.get('.dropdown-item').contains(searchString1);
      cy.get('.dropdown-item').should('have.length', 1);
      cy.get('input[type=text]').clear();
    });
  })

  it('displays events', () => {
    cy.visit('/events');
    cy.get('#events').should('exist');
  });

  it('displays the events page with result when data range is choosed', () => {
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": "action:authentication",
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('table th').then(table => {
      expect(table.length).to.be.greaterThan(0);
    });
  });

  it('displays the events page with result when data filter fi is choosed', () => {
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": "fi:dgfip",
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

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
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": "fi:ameli",
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

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
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": "action:authentication",
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('.dropdown-item').should('have.length', 10);
    });
  });

  it('display elements "Types actions" that match with search', () => {
    const searchString1 = 'iden';

    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": "action:authentication",
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('input[type=text]').type(searchString1);
      cy.get('.dropdown-item').contains(searchString1);
      cy.get('.dropdown-item').should('have.length', 2);
      cy.get('input[type=text]').clear();
    });
  });

  it('display elements "Types actions" checked even after a search', () => {
    const searchString = 'con';

    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      search: ["", "", ""],
      "filters[]": "action:consent",
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('.dropdown-item').eq(1).click();
      cy.get('input[type=text]').type(searchString);
      cy.get('.dropdown-item').eq(1).click();
      cy.get('input[type=text]').clear();
      cy.get('.dropdown-item')
        .eq(0)
        .children('input')
        .should('be.checked');
    });
  });

  it('displays bar chart page without JS error', () => {
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      search: ["", "", ""],
      "filters[]": "action:consent",
      visualize: "bar",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('canvas[data-type=bar]');
  });

  it('displays line chart page without JS error', () => {
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      search: ["", "", ""],
      "filters[]": "action:consent",
      visualize: "line",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('canvas[data-type=line]');
  });

  it('displays pie chart page without JS error', () => {
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      search: ["", "", ""],
      "filters[]": "action:consent",
      visualize: "pie",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('canvas[data-type=pie]');
  });

  it('UI controls are working', () => {
    cy.visit(`/events`);

    cy.get('#start').click();
    cy.get('.lightpick__day:first').click();
    cy.get('.lightpick__day:last').click();
    cy.get('#bouton-filtrer').click();

    cy.get('input[name="start"]').invoke('val').then(val => {
      const start = val;
      cy.url().should('include', `?start=${start}`);
    });
    cy.get('input[name="stop"]').invoke('val').then(val => {
      const stop = val;
      cy.url().should('include', `&stop=${stop}`);
    });
  });

  it('Checks the chosen values in dropdowns', () => {
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": ["fi:dgfip", "fi:ameli"],
      visualize: "bar",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

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

  it('should display in "type actions" dropdown the corresponding checked "action"', () => {
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": ["action:consent"],
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('#action-dropdown').within(() => {
      cy.get('button').click();
      cy.get('label[for="filters[]action:consent"]').prev('input').should('be.checked');
    });

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('.dropdown-item').should('have.length', 4);
    });
  });

  it('should deselect "Connexion" category', () => {
    cy.visit(`/events`);

    cy.get('#action-dropdown').within(() => {
      cy.get('button').click();
      cy.get('label[for="filters[]action:authentication"]').prev('input').should('be.checked');
      cy.get('label[for="filters[]action:authentication"]').prev('input').uncheck({
        force: true
      });
      cy.get('label[for="filters[]action:authentication"]').prev('input').should('be.not.checked');
    });
  });

  it('should change and keep dates after a search', () => {
    // define date range
    const start = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const stop = moment().subtract(3, 'days').format('YYYY-MM-DD');


    cy.visit(`/events`);

    // change dates
    cy.get('#start')
      .clear({ force: true })
      .type(start);
    cy.get('#stop')
      .clear({ force: true })
      .type(stop);

    // trigger search
    cy.get('#bouton-filtrer').click();

    // date range should be equal to what is expected
    cy.get('#start').invoke('val').should('eq', start);
    cy.get('#stop').invoke('val').should('eq', stop);
  });

  it('should display in "type actions" dropdown the two corresponding checked "actions"', () => {
    const query = {
      start: START,
      stop: STOP,
      "columns[]": ["fi", "action"],
      "filters[]": ["action:consent", "action:eidas"],
      visualize: "list",
      granularity: "month",
      x: "date",
      y: "fs"
    };
    cy.visit(`/events?${qs.stringify(query)}`);

    cy.get('#action-dropdown').within(() => {
      cy.get('button').click();
      cy.get('label[for="filters[]action:consent"]').prev('input').should('be.checked');
    });

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('.dropdown-item').should('have.length', 5);
    });
  });

  it("should be possible to search the term 'Récupération de l'access token'", () => {
    cy.visit(`/events`);

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('input[type=text]').type("Récupération de l'access token");
      cy.get('.dropdown-item').contains("Récupération de l'access token").should('have.length', 1);
    });
  });

  it("should be possible to search the term 'Accès aux données de l'usager par le FS'", () => {
    cy.visit(`/events`);

    cy.get('#typeAction-dropdown').within(() => {
      cy.get('button').click();
      cy.get('input[type=text]').type("Accès aux données de l'usager par le FS");
      cy.get('.dropdown-item').contains("Accès aux données de l'usager par le FS").should('have.length', 1);
    });
  });
});
