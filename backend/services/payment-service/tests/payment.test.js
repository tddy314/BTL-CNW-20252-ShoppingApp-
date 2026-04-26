const request = require('supertest');
const app = require('../index');

describe('Payment service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('POST /pay with missing fields returns 400', async () => {
    const res = await request(app).post('/pay').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /pay succeeds with amount and method', async () => {
    const res = await request(app)
      .post('/pay')
      .send({ amount: 1000, method: 'card', orderId: 'order_1' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('transactionId');
  });
});
