import * as owasp from 'owasp-password-strength-test';

const MINIMUM_LENGTH = 10;

export const getPasswordComplianceErrors = (password: string) => {
  owasp.config({
    minLength: MINIMUM_LENGTH,
  });
  return owasp.test(password).errors;
};
