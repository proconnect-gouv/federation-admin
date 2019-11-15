
export function login(username, password) {
  cy.visit('/login');
  cy.formFill({ username, password }, { fast: true });
  cy.get('button[type="submit"]').click();
}

export function logout(username) {
  cy.get('.dropdown-toggle')
    .contains(username)
    .click();
  cy.contains('Déconnexion').click();
}
