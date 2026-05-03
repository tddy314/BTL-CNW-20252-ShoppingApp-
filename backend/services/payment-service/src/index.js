const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(express.json());

app.use('/', paymentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Payment service listening on port ${PORT}`));
}
