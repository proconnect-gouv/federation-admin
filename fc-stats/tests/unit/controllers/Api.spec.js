import Api from '../../../src/controllers/Api';

describe('Controllers/api', () => {
  describe('handleError', () => {
    it('Shoud call res.status with a 500 and not disclose stack trace', () => {
      // Given
      const error = {
        message: 'something bad happened',
      };
      const res = {
        status: jest.fn(),
        json: jest.fn(),
      };
      // When
      Api.handleError(error, res);
      // Then
      expect(res.status.mock.calls).toHaveLength(1);
      expect(res.status.mock.calls[0][0]).toBe(500);
      expect(res.json.mock.calls).toHaveLength(1);
      expect(res.json.mock.calls[0][0].error).toBeDefined();
      expect(res.json.mock.calls[0][0].error).toEqual({
        message: 'something bad happened',
      });
      expect(res.json.mock.calls[0][0].stack).not.toBeDefined();
    });
  });
  it('Shoud call res.status with a 400 and show more info', () => {
    // Given
    const error = {
      message: 'something bad happened',
      type: 'input',
      stack: ['bad stuff'],
    };
    const res = {
      status: jest.fn(),
      json: jest.fn(),
    };
    // When
    Api.handleError(error, res);
    // Then
    expect(res.status.mock.calls).toHaveLength(1);
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(res.json.mock.calls).toHaveLength(1);
    expect(res.json.mock.calls[0][0].error).toBeDefined();
    expect(res.json.mock.calls[0][0].error.message).toBe(
      'something bad happened'
    );
    expect(res.json.mock.calls[0][0].error.stack).toEqual(['bad stuff']);
  });
});
