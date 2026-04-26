const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/pay', (req, res) => {
  const { amount, method, orderId } = req.body || {};
  if (!amount || !method) {
    return res.status(400).json({ error: 'missing amount or method' });
  }

  // Simulate a payment processing flow
  const transactionId = `tx_${Date.now()}`;

  // In a real service we'd call a provider here and persist transaction
  return res.json({ status: 'success', transactionId, orderId, amount });
});

// Export app for tests
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service listening on port ${PORT}`);
  });
}
