import * as otplib from 'otplib';

export async function getTotp(key) {
  return new Promise(resolve => {
    const ttl = otplib.authenticator.timeRemaining();

    if (ttl > 2) {
      return resolve(otplib.authenticator.generate(key));
    }

    const wait = ttl + 1;
    cy.log(`Waiting ${wait} secs. to ensure TOTP validity`);
    setTimeout(() => {
      cy.log(`Waited enough`);
      resolve(otplib.authenticator.generate(key));
    }, wait * 1000);
  });
}
