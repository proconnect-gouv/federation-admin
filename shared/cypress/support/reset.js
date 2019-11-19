export function resetMongoFC() {
  const command = 'cd $FC_ROOT/Infra/docker && CI=1 ./docker-stack reset_db';

  console.log(`
    Executing command:
    > ${command}
  `);

  cy.exec(command, console.log);
}

export function resetPostgres() {
  const commandBase = `docker exec fc_${Cypress.env(
    'APP_NAME',
  )}_1 bash -c 'cd /var/www/app/fc-${Cypress.env('APP_NAME')} && `;

  const commands = [
    'yarn typeorm schema:drop',
    'yarn typeorm migrations:run',
    'yarn fixtures:load',
  ];

  commands.forEach(command => {
    cy.log(`
      Executing command:
      > ${commandBase} ${command}'
    `);

    cy.exec(`${commandBase} ${command}'`);
  });
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
