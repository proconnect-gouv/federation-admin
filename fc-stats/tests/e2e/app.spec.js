import request from 'supertest';
import app from '../../src/app';

const PORT = process.env.PORT || 3000;

const req = request(`http://localhost:${PORT}`);

describe('App', () => {
  beforeAll(() => {
    app.instance = app.start(PORT);
  });

  afterAll(() => app.instance.close());

  describe('Index', () => {
    it('should respond', async () => {
      // Given
      const url = '/';
      // When
      const res = await req.get(url);
      // Then
      expect(res.status).toBe(200);
    });

    it('should display a fancy message', async () => {
      // Given
      const url = '/';
      // When
      const resp = await req.get(url);
      // Then
      expect(resp.text).toBe("I'm alive!\n");
    });
  });
});

describe('API@v1 E2E', () => {
  const BASE_URL = '/api/v1';

  beforeAll(() => {
    app.instance = app.start(PORT);
  });

  afterAll(() => app.instance.close());

  describe('getTotalConnexions', () => {
    it('should return correct JSON', async () => {
      // Given
      const url = `${BASE_URL}/total/newauthenticationquery/2018-01-01/2019-03-01`;
      // When
      const resp = await req.get(url);
      // Then
      expect(resp.status).toBe(200);
      expect(resp.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(typeof resp.body.payload.count).toBe('number');
      expect(resp.body.payload.start).toBe('2018-01-01T00:00:00.000Z');
      expect(resp.body.payload.stop).toBe('2019-03-01T00:00:00.000Z');
      expect(resp.body.payload.action).toBe('newauthenticationquery');
    });
  });

  describe('getTotalForActionsAndFiAndRangeByWeek', () => {
    it('should return correct JSON', async () => {
      // Given
      const url = `${BASE_URL}/totalByFi/dgfip/2018-01-01/2018-03-01`;
      // When
      const resp = await req.get(url);
      // Then
      expect(resp.status).toBe(200);
      expect(resp.header['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(Array.isArray(resp.body.payload.weeks)).toBe(true);
      expect(Array.isArray(resp.body.payload.weeks[0].events)).toBe(true);
      expect(resp.body.payload.weeks[0].events[0].count).toBeDefined();
      expect(resp.body.payload.weeks[0].events[0].label).toBeDefined();
      expect(resp.body.payload.start).toBe('2018-01-01T00:00:00.000Z');
      expect(resp.body.payload.stop).toBe('2018-03-01T00:00:00.000Z');
      expect(resp.body.payload.fi).toBe('dgfip');
    });
  });
});
