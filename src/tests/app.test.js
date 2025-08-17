const request = require('supertest');
const app = require('../../app');

describe('Health Check', () => {
  it('should return API is running', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'API is running');
  });
});
