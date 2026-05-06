const express = require('express');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SERVICE_NAME = 'payment-service';
const SERVICE_VERSION = '1.0.0-mock';
const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || 'USD';

const SUPPORTED_PAYMENT_METHODS = [
  {
    code: 'card',
    label: 'Credit/Debit Card',
    minAmount: 1,
    maxAmount: 500000,
    processingFeePercent: 2.5,
    processingFeeFixed: 0.3,
  },
  {
    code: 'bank_transfer',
    label: 'Bank Transfer',
    minAmount: 5,
    maxAmount: 1000000,
    processingFeePercent: 1.2,
    processingFeeFixed: 0.5,
  },
  {
    code: 'cash',
    label: 'Cash on Delivery',
    minAmount: 1,
    maxAmount: 20000,
    processingFeePercent: 0,
    processingFeeFixed: 0,
  },
  {
    code: 'wallet',
    label: 'E-Wallet',
    minAmount: 1,
    maxAmount: 100000,
    processingFeePercent: 1.8,
    processingFeeFixed: 0.2,
  },
];

const payments = new Map();

function nowIso() {
  return new Date().toISOString();
}

function buildId(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function getMethodConfig(method) {
  return SUPPORTED_PAYMENT_METHODS.find((item) => item.code === method);
}

function toAmount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return NaN;
  return Math.round(number * 100) / 100;
}

function buildFailureResponse(code, message, details = null) {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
      timestamp: nowIso(),
    },
  };
}

function buildSuccessResponse(data) {
  return {
    ok: true,
    data,
    meta: {
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      timestamp: nowIso(),
    },
  };
}

function validateCreatePayload(payload) {
  const { amount, method, orderId, currency = DEFAULT_CURRENCY } = payload || {};

  if (!orderId || typeof orderId !== 'string') {
    return buildFailureResponse('INVALID_ORDER_ID', 'orderId is required and must be a string');
  }

  const normalizedAmount = toAmount(amount);
  if (!normalizedAmount || normalizedAmount <= 0) {
    return buildFailureResponse('INVALID_AMOUNT', 'amount must be a positive number');
  }

  if (!method || typeof method !== 'string') {
    return buildFailureResponse('INVALID_METHOD', 'method is required and must be a string');
  }

  const methodConfig = getMethodConfig(method);
  if (!methodConfig) {
    return buildFailureResponse('METHOD_NOT_SUPPORTED', `method '${method}' is not supported`);
  }

  if (normalizedAmount < methodConfig.minAmount || normalizedAmount > methodConfig.maxAmount) {
    return buildFailureResponse(
      'AMOUNT_OUT_OF_RANGE',
      `amount must be between ${methodConfig.minAmount} and ${methodConfig.maxAmount} for method ${method}`
    );
  }

  const normalizedCurrency = String(currency).trim().toUpperCase();

  return {
    ok: true,
    value: {
      amount: normalizedAmount,
      method,
      orderId,
      currency: normalizedCurrency,
      methodConfig,
    },
  };
}

function calculateFee(amount, methodConfig) {
  const variable = (amount * methodConfig.processingFeePercent) / 100;
  const totalFee = Math.round((variable + methodConfig.processingFeeFixed) * 100) / 100;
  return totalFee;
}

function getPaymentOr404(paymentId, res) {
  const payment = payments.get(paymentId);
  if (!payment) {
    res.status(404).json(buildFailureResponse('PAYMENT_NOT_FOUND', `payment ${paymentId} not found`));
    return null;
  }
  return payment;
}

app.get('/health', (req, res) => {
  res.json(
    buildSuccessResponse({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      paymentsInMemory: payments.size,
    })
  );
});

app.get('/payment-methods', (req, res) => {
  return res.json(buildSuccessResponse({ methods: SUPPORTED_PAYMENT_METHODS }));
});

app.get('/payments', (req, res) => {
  const { status, orderId, method } = req.query || {};

  let items = Array.from(payments.values());
  if (status) {
    items = items.filter((item) => item.status === String(status));
  }
  if (orderId) {
    items = items.filter((item) => item.orderId === String(orderId));
  }
  if (method) {
    items = items.filter((item) => item.method === String(method));
  }

  return res.json(buildSuccessResponse({ count: items.length, items }));
});

app.get('/payments/:paymentId', (req, res) => {
  const payment = getPaymentOr404(req.params.paymentId, res);
  if (!payment) return;
  return res.json(buildSuccessResponse(payment));
});

app.post('/payments', (req, res) => {
  const validation = validateCreatePayload(req.body);
  if (!validation.ok) {
    return res.status(400).json(validation);
  }

  const { amount, method, orderId, currency, methodConfig } = validation.value;
  const fee = calculateFee(amount, methodConfig);
  const paymentId = buildId('pay');
  const transactionId = buildId('tx');
  const clientSecret = buildId('sec');

  const payment = {
    paymentId,
    transactionId,
    clientSecret,
    orderId,
    amount,
    currency,
    method,
    status: 'requires_confirmation',
    fee,
    netAmount: Math.round((amount - fee) * 100) / 100,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    history: [
      {
        action: 'created',
        at: nowIso(),
        note: 'payment intent created',
      },
    ],
  };

  payments.set(paymentId, payment);

  return res.status(201).json(buildSuccessResponse(payment));
});

app.post('/payments/:paymentId/confirm', (req, res) => {
  const payment = getPaymentOr404(req.params.paymentId, res);
  if (!payment) return;

  if (payment.status !== 'requires_confirmation') {
    return res.status(400).json(
      buildFailureResponse('INVALID_STATUS', `payment cannot be confirmed from status ${payment.status}`)
    );
  }

  const { forceFail = false, gatewayRef } = req.body || {};

  if (forceFail) {
    payment.status = 'failed';
    payment.updatedAt = nowIso();
    payment.history.push({
      action: 'confirmation_failed',
      at: nowIso(),
      note: 'forced failure by request',
      gatewayRef: gatewayRef || null,
    });

    return res.status(402).json(
      buildFailureResponse('PAYMENT_FAILED', 'payment authorization failed', {
        paymentId: payment.paymentId,
        transactionId: payment.transactionId,
      })
    );
  }

  payment.status = 'succeeded';
  payment.updatedAt = nowIso();
  payment.history.push({
    action: 'confirmed',
    at: nowIso(),
    note: 'payment confirmed successfully',
    gatewayRef: gatewayRef || null,
  });

  return res.json(buildSuccessResponse(payment));
});

app.post('/payments/:paymentId/cancel', (req, res) => {
  const payment = getPaymentOr404(req.params.paymentId, res);
  if (!payment) return;

  if (payment.status === 'succeeded') {
    return res.status(400).json(
      buildFailureResponse('CANNOT_CANCEL_SUCCEEDED_PAYMENT', 'use refund endpoint for succeeded payment')
    );
  }

  if (payment.status === 'cancelled') {
    return res.status(400).json(buildFailureResponse('ALREADY_CANCELLED', 'payment already cancelled'));
  }

  payment.status = 'cancelled';
  payment.updatedAt = nowIso();
  payment.history.push({
    action: 'cancelled',
    at: nowIso(),
    note: req.body?.reason || 'cancelled by request',
  });

  return res.json(buildSuccessResponse(payment));
});

app.post('/payments/:paymentId/refund', (req, res) => {
  const payment = getPaymentOr404(req.params.paymentId, res);
  if (!payment) return;

  if (payment.status !== 'succeeded') {
    return res.status(400).json(
      buildFailureResponse('INVALID_STATUS', `payment cannot be refunded from status ${payment.status}`)
    );
  }

  const requestedAmount = req.body?.amount ? toAmount(req.body.amount) : payment.amount;
  if (!requestedAmount || requestedAmount <= 0) {
    return res.status(400).json(buildFailureResponse('INVALID_AMOUNT', 'refund amount must be positive'));
  }

  if (requestedAmount > payment.amount) {
    return res.status(400).json(buildFailureResponse('INVALID_AMOUNT', 'refund amount exceeds payment amount'));
  }

  const refundId = buildId('rf');
  const isFullRefund = requestedAmount === payment.amount;
  payment.status = isFullRefund ? 'refunded' : 'partially_refunded';
  payment.updatedAt = nowIso();
  payment.history.push({
    action: 'refunded',
    at: nowIso(),
    refundId,
    amount: requestedAmount,
    note: req.body?.reason || null,
  });

  return res.json(
    buildSuccessResponse({
      paymentId: payment.paymentId,
      refundId,
      refundedAmount: requestedAmount,
      status: payment.status,
      updatedAt: payment.updatedAt,
    })
  );
});

app.get('/stats', (req, res) => {
  const stats = {
    total: 0,
    succeeded: 0,
    failed: 0,
    cancelled: 0,
    refunded: 0,
    requires_confirmation: 0,
    partially_refunded: 0,
    totalProcessedAmount: 0,
  };

  for (const payment of payments.values()) {
    stats.total += 1;
    if (typeof stats[payment.status] === 'number') {
      stats[payment.status] += 1;
    }
    if (payment.status === 'succeeded' || payment.status === 'refunded' || payment.status === 'partially_refunded') {
      stats.totalProcessedAmount += payment.amount;
    }
  }

  stats.totalProcessedAmount = Math.round(stats.totalProcessedAmount * 100) / 100;

  return res.json(buildSuccessResponse(stats));
});

app.post('/webhooks/provider-callback', (req, res) => {
  const { paymentId, eventType, payload } = req.body || {};
  if (!paymentId || !eventType) {
    return res.status(400).json(buildFailureResponse('INVALID_WEBHOOK', 'paymentId and eventType are required'));
  }

  const payment = getPaymentOr404(paymentId, res);
  if (!payment) return;

  payment.history.push({
    action: 'webhook_received',
    at: nowIso(),
    eventType,
    payload: payload || null,
  });
  payment.updatedAt = nowIso();

  return res.json(buildSuccessResponse({ received: true, paymentId, eventType }));
});

// Backward-compatible endpoint for old tests/integrations
app.post('/pay', (req, res) => {
  const createRes = validateCreatePayload(req.body);
  if (!createRes.ok) {
    return res.status(400).json({ error: createRes.error.message });
  }

  const { amount, method, orderId, currency, methodConfig } = createRes.value;
  const fee = calculateFee(amount, methodConfig);
  const paymentId = buildId('pay');
  const transactionId = buildId('tx');

  const payment = {
    paymentId,
    transactionId,
    orderId,
    amount,
    currency,
    method,
    status: 'succeeded',
    fee,
    netAmount: Math.round((amount - fee) * 100) / 100,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    history: [{ action: 'created_and_confirmed', at: nowIso() }],
  };

  payments.set(paymentId, payment);
  return res.json({ status: 'success', transactionId, orderId, amount });
});

// Export app for tests
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service listening on port ${PORT}`);
  });
}
