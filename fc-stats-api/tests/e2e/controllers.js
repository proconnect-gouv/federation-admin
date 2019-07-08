import request from 'supertest';
import app from '../../src/app';

const PORT = process.env.PORT || 3000;

const req = request(`http://localhost:${PORT}`);

describe('Controllers/Api', () => {
  const BASE_URL = '/api/v1';

  beforeAll(() => {
    app.instance = app.start(PORT);
  });

  afterAll(() => app.instance.close());

  describe('getTotalConnexions', () => {
    it('should return a 400 error on invalid input', async () => {
      // Given
      const url = `${BASE_URL}/total/never-gonna/let-you/down`;
      // When
      const resp = await req.get(url);
      // Then
      expect(resp.status).toBe(400);
      expect(resp.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(typeof resp.body.error).toBe('object');
      expect(typeof resp.body.error.message).toBe('string');
      expect(Array.isArray(resp.body.error.stack)).toBe(true);
    });
  });

  describe('getTotalForActionsAndFiAndRange', () => {
    it('should return a 400 error on invalid input', async () => {
      // Given
      const url = `${BASE_URL}/totalByFi/never-gonna/let-you/down`;
      // When
      const resp = await req.get(url);
      // Then
      expect(resp.status).toBe(400);
      expect(resp.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(typeof resp.body.error).toBe('object');
      expect(typeof resp.body.error.message).toBe('string');
      expect(Array.isArray(resp.body.error.stack)).toBe(true);
    });
  });
});
