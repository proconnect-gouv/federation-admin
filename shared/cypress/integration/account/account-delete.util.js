import { SECRET_TOTP } from '../../../../shared/cypress/integration/util/constants.util';
import { getTotp } from '../../../../shared/cypress/integration/util/totp.util';

export function deleteUser(username, basicConfiguration) {
  cy.get(
    `form[data-element-title="${username}"] button.btn-action-delete`,
  ).click();
  cy.wait(500);
  cy.contains(`Voulez-vous supprimer le compte ${username} ?`);
  if (basicConfiguration.confirmSuppression) {
    cy.get('#totpModal').then(async () => {
      const token = await getTotp(SECRET_TOTP);
      cy.get('#totpModal').type(token);
    });
    cy.contains('Confirmer').click();
  } else {
    cy.contains('Annuler').click();
  }
  cy.wait(500);
}
