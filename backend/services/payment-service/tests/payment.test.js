const request = require('supertest');
const app = require('../index');

describe('Payment service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('data.status', 'ok');
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

  test('GET /payment-methods returns list', async () => {
    const res = await request(app).get('/payment-methods');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(Array.isArray(res.body.data.methods)).toBe(true);
    expect(res.body.data.methods.length).toBeGreaterThan(0);
  });

  test('POST /payments creates payment intent', async () => {
    const res = await request(app)
      .post('/payments')
      .send({ amount: 120, method: 'card', orderId: 'order_2' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body.data).toHaveProperty('paymentId');
    expect(res.body.data).toHaveProperty('status', 'requires_confirmation');
  });

  test('POST /payments/:id/confirm confirms payment', async () => {
    const create = await request(app)
      .post('/payments')
      .send({ amount: 150, method: 'card', orderId: 'order_3' });

    const paymentId = create.body.data.paymentId;

    const confirm = await request(app)
      .post(`/payments/${paymentId}/confirm`)
      .send({ gatewayRef: 'gw_abc' });

    expect(confirm.statusCode).toBe(200);
    expect(confirm.body).toHaveProperty('ok', true);
    expect(confirm.body.data).toHaveProperty('status', 'succeeded');
  });

  test('POST /payments/:id/refund refunds succeeded payment', async () => {
    const create = await request(app)
      .post('/payments')
      .send({ amount: 200, method: 'card', orderId: 'order_4' });

    const paymentId = create.body.data.paymentId;

    await request(app).post(`/payments/${paymentId}/confirm`).send({});

    const refund = await request(app)
      .post(`/payments/${paymentId}/refund`)
      .send({ amount: 50, reason: 'test refund' });

    expect(refund.statusCode).toBe(200);
    expect(refund.body).toHaveProperty('ok', true);
    expect(refund.body.data).toHaveProperty('status', 'partially_refunded');
  });
});
