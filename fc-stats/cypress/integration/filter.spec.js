const BASE_URL = 'https://stats.docker.dev-franceconnect.fr/';
const USER_ADMIN = 'jean_moust';
const USER_OPERATOR = 'jean_patoche';
const USER_PASS = 'georgesmoustaki';

describe('the current user has the admin role', () => {
    beforeEach(() => {
      cy.visit(`${BASE_URL}`);
      cy.get('input[name="username"]').type(USER_ADMIN);
      cy.get('input[name="password"]').type(USER_PASS);
      cy.get('button[type="submit"]').click();
    });

    it('displays the stat page with', () => {
        cy.contains('Mesure All the things!')
        cy.contains('Choisissez des dates')
    });
    it('displays the stat page with result when data range is choosed', () => {
      cy.visit('https://stats.docker.dev-franceconnect.fr/stats?start=2016-01-01&stop=2019-07-31')
      cy.get('table th').then(table => {
        expect(table.length).to.be.greaterThan(0)
      });
    });
    it('displays the stat page with result when data filter fi is choosed', () => {
      cy.visit('https://stats.docker.dev-franceconnect.fr/stats?start=2018-01-01&stop=2018-12-30&filters[]=fi%3Adgfip')
      cy.get('table th').then(table => {
        expect(table.length).to.be.greaterThan(0)
      });
      cy.get('tbody td').first().should('contain', 'dgfip')
      cy.get('tbody td').last().prev().prev().prev().should('contain', 'dgfip')
    });
});