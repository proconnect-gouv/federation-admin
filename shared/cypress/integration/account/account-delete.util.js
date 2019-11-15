export function deleteUser(username, basicConfiguration) {
  cy.get(
    `form[data-element-title="${username}"] button.btn-action-delete`,
  ).click();
  cy.contains(`Voulez-vous supprimer le compte ${username} ?`);

  if (basicConfiguration.confirmSuppression) {
    cy.get('[name="_totp"]');
    cy.totp({ totp: true });
    cy.contains('Confirmer').click();
  } else {
    cy.contains('Annuler').click();
  }
}
