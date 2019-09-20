import { getPasswordComplianceErrors } from './password.service';

describe('PasswordService', () => {
  describe('getPasswordComplianceErrors', () => {
    it('returns the compliance errors', () => {
      const errors = getPasswordComplianceErrors('coucou123');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('takes the minimum length from the configuration', () => {
      const invalidPassword = '#W2g,hY9';
      const invalidPasswordErrors = getPasswordComplianceErrors(
        invalidPassword,
      );
      expect(invalidPasswordErrors.length).toBeGreaterThan(0);

      const validPassword = 'aa#W2g,hY9sL';
      const validPasswordErrors = getPasswordComplianceErrors(validPassword);
      expect(validPasswordErrors.length).toEqual(0);
    });
  });
});
