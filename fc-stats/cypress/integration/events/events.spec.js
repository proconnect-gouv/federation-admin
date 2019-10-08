import moment from 'moment';
import { BASE_URL, USER_OPERATOR, USER_PASS } from '../constants.util';
import { login } from '../login.util';


const START = moment().add(-3, 'month').format('YYYY-MM-DD');
const STOP = moment().add(3, 'month').format('YYYY-MM-DD');

describe('the current user has the admin role', () => {
    beforeEach(() => {
      login(USER_OPERATOR, USER_PASS);
    });

    it('displays the stat page with', () => {
        cy.contains('Choisissez des dates')
    });

    it('displays the stat page with result when data range is choosed', () => {
      cy.visit(`${BASE_URL}/stats?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=list&granularity=month&x=date&y=fs`)
      cy.get('table th').then(table => {
        expect(table.length).to.be.greaterThan(0)
      });
    });

    it('displays the stat page with result when data filter fi is choosed', () => {
      cy.visit(`${BASE_URL}/stats?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&filters%5B%5D=fi%3Adgfip&visualize=list&granularity=month&x=date&y=fs`)
      cy.get('table th').then(table => {
        expect(table.length).to.be.greaterThan(0)
      });
      cy.get('tbody td').first().should('contain', 'dgfip')
      cy.get('tbody tr:last td').first().should('contain', 'dgfip')
    });


    it('displays the stat page with result when another filter fi is choosed', () => {
      cy.visit(`${BASE_URL}/stats?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&filters%5B%5D=fi%3Aameli&visualize=list&granularity=month&x=date&y=fs`)
      cy.get('table th').then(table => {
        expect(table.length).to.be.greaterThan(0)
      });
      cy.get('tbody td').first().should('contain', 'ameli')
      cy.get('tbody tr:last td').first().should('contain', 'ameli')
    });

    it('displays bar chart page without JS error', () => {
      cy.visit(`${BASE_URL}/stats?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=bar&granularity=month&x=date&y=fs`)
      cy.get('canvas[data-type=bar]');
    });

    it('displays line chart page without JS error', () => {
      cy.visit(`${BASE_URL}/stats?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=line&granularity=month&x=date&y=fs`)
      cy.get('canvas[data-type=line]');
    });

    it('displays pie chart page without JS error', () => {
      cy.visit(`${BASE_URL}/stats?start=${START}&stop=${STOP}&columns%5B%5D=fi&columns%5B%5D=action&visualize=pie&granularity=month&x=date&y=fs`)
      cy.get('canvas[data-type=pie]');
    });

    it('UI controls are working', () => {
      cy.visit(`${BASE_URL}/stats`);

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
      cy.get('tbody td').first().should('contain', 'AliceM');
      cy.get('tbody tr:last td').first().should('contain', 'AliceM');


      cy.get('#visualize-dropdown button').click();
      cy.get('#visualize-dropdown label[for="visualizeline"]').click();
      cy.get('#bouton-filtrer').click();

      cy.get('canvas[data-type="line"]');


    });
});
