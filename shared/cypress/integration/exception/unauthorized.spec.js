describe('Unauthorized - error 401', () => {
  it('Should redirect on the login page if we are not connected', () => {
    cy.visit(`${Cypress.env('BASE_URL')}`);
    cy.url().should('eq', `${Cypress.env('BASE_URL')}/login`);
    cy.get('form').should('be.visible');
  });
});
