import { MailerFactory, StdoutMailer } from '../../../../src/services/Mailer';

describe('services/Mailer/MailerFactory', () => {
  describe('get', () => {
    it('Should throw if instance type is unknow', () => {
      // Given
      const type = 'foo';
      // Then
      expect(() => MailerFactory.get(type)).toThrow();
    });
    it('Should return an instance of given type', () => {
      // Given
      const type = 'log';
      const container = { services: { config: {}, logger: {} } };
      // When
      const result = MailerFactory.get(type, container);
      // Then
      expect(result instanceof StdoutMailer).toBe(true);
    });
    it('Should return a singleton', () => {
      // Given
      const type = 'log';
      const container = { config: {}, logger: {} };
      // When
      const resultA = MailerFactory.get(type, container);
      const resultB = MailerFactory.get(type);
      // Then
      expect(resultA).toBe(resultB);
    });
  });
});
