export function login(username, password) {
  cy.visit(`${Cypress.env('BASE_URL')}/login`);
  cy.get('input[name="username"]').clear().type(username);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
}

export function logout(username) {
  cy.get('.dropdown-toggle').contains(username).click();
  cy.contains('Déconnexion').click();
}
