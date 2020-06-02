export function updatePassword(basicConfiguration) {
  cy.contains('bill').click();
    cy.contains('Mon compte').click();
    cy.formType('#currentPassword', 'MyNewPassword10!!');
    cy.formType('#password', 'MyNewPassword20!!');
    cy.formType('#confirm-password', 'MyNewPassword20!!');
    cy.get('#secret > td').then(async secret => {
      await cy.totp(basicConfiguration, secret[0].textContent);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains('Le mot de passe a bien été mis à jour !');
    
    cy.contains('bill').click();
    cy.contains('Mon compte').click();
    cy.formType('#currentPassword', 'MyNewPassword20!!');
    cy.formType('#password', 'MyNewPassword201!!');
    cy.formType('#confirm-password', 'MyNewPassword201!!');
    cy.get('#secret > td').then(async secret => {
      await cy.totp(basicConfiguration, secret[0].textContent);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains('Le mot de passe a bien été mis à jour !');
    
    cy.contains('bill').click();
    cy.contains('Mon compte').click();
    cy.formType('#currentPassword', 'MyNewPassword201!!');
    cy.formType('#password', 'MyNewPassword202!!');
    cy.formType('#confirm-password', 'MyNewPassword202!!');
    cy.get('#secret > td').then(async secret => {
      await cy.totp(basicConfiguration, secret[0].textContent);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains('Le mot de passe a bien été mis à jour !');
      
    cy.contains('bill').click();
    cy.contains('Mon compte').click();
    cy.formType('#currentPassword', 'MyNewPassword202!!');
    cy.formType('#password', 'MyNewPassword203!!');
    cy.formType('#confirm-password', 'MyNewPassword203!!');
    cy.get('#secret > td').then(async secret => {
      await cy.totp(basicConfiguration, secret[0].textContent);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains('Le mot de passe a bien été mis à jour !');

    cy.contains('bill').click();
    cy.contains('Mon compte').click();
    cy.formType('#currentPassword', 'MyNewPassword203!!');
    cy.formType('#password', 'MyNewPassword203!!');
    cy.formType('#confirm-password', 'MyNewPassword203!!');
    cy.get('#secret > td').then(async secret => {
      await cy.totp(basicConfiguration, secret[0].textContent);
    });
    cy.contains('Mettre à jour mon mot de passe').click();
    cy.contains('Votre nouveau mot de passe a déjà été utilisé.');
}