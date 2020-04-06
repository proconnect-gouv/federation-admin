export function resetMongoFC() {
  const command = 'cd $FC_ROOT/infra/docker && CI=1 ./docker-stack reset-db';

  console.log(`
    Executing command:
    > ${command}
  `);

  cy.exec(command, console.log);
}

export function resetPostgres() {
  const command = ` ../shared/cypress/support/db.sh ${Cypress.env('APP_NAME')} apply`;

  cy.log(`
    Executing command:
    > ${command}'
    `);

  cy.exec(command);
}

export function resetElasticStats() {
  const command =
    'cd $FC_ROOT/fc-apps/fc-stats/fixtures && ./generate-stats.sh';
  cy.log(`
    Executing command:
    > ${command}
  `);

  cy.exec(command);
}
