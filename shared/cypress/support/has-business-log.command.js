// Path to script
const EXEC_TOOL_PATH = './cypress/support/parseBusinessLog.js';
const LOG_FILE_PATH = Cypress.env('LOG_FILE_PATH');

export function hasBusinessLog(event) {
  const stringifiedEvent = JSON.stringify(event);
  const command = `node ${EXEC_TOOL_PATH} '${LOG_FILE_PATH}' '${stringifiedEvent}'`;

  console.log(
    `
    Executing command:
    > ${command}
    `,
  );

  cy.log('Check business logs');

  return cy
    .exec(command)
    .its('code')
    .should('eq', 0);
}
