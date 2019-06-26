import Authentication from '../../../src/services/Authentication';

describe('services/authentication', () => {
  describe('express middleware', () => {
    it('Should return a 401 if not credentials given', () => {
      // Given
      const req = { headers: {} };
      const res = { sendStatus: jest.fn() };
      const next = jest.fn();
      const config = { token: 'foo' };
      const auth = new Authentication(config);
      // When
      auth.middleware(req, res, next);
      // Then
      expect(res.sendStatus.mock.calls).toHaveLength(1);
      expect(res.sendStatus.mock.calls[0][0]).toBe(401);
      expect(next.mock.calls).toHaveLength(0);
    });

    it('Should return a 403 if bad credentials given', () => {
      // Given
      const req = { headers: { token: 'bar' } };
      const res = { sendStatus: jest.fn() };
      const next = jest.fn();
      const config = { token: 'foo' };
      const auth = new Authentication(config);
      // When
      auth.middleware(req, res, next);
      // Then
      expect(res.sendStatus.mock.calls).toHaveLength(1);
      expect(res.sendStatus.mock.calls[0][0]).toBe(403);
      expect(next.mock.calls).toHaveLength(0);
    });

    it('Should call next if correct credentials given', () => {
      // Given
      const req = { headers: { token: 'foo' } };
      const res = { sendStatus: jest.fn() };
      const next = jest.fn();
      const config = { token: 'foo' };
      const auth = new Authentication(config);
      // When
      auth.middleware(req, res, next);
      // Then
      expect(res.sendStatus.mock.calls).toHaveLength(0);
      expect(next.mock.calls).toHaveLength(1);
    });
  });
});
