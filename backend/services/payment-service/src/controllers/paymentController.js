const paymentRepository = require('../repositories/paymentRepository');

exports.health = (req, res) => {
  res.json({ status: 'ok' });
};

exports.pay = async (req, res) => {
  try {
    const { amount, method, orderId } = req.body || {};
    if (!amount || !method) {
      return res.status(400).json({ error: 'missing amount or method' });
    }

    const transactionId = await paymentRepository.createTransaction({ amount, method, orderId });

    return res.json({ status: 'success', transactionId, orderId, amount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
};

exports.uploadReceipt = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'no file uploaded' });

    // attempt to persist and associate receipt with a transaction
    const { amount, method, orderId } = req.body || {};
    const transactionId = await paymentRepository.createTransaction({ amount, method, orderId, receiptPath: file.path });

    // try upload to Supabase storage (inside repository)
    const remoteUrl = await paymentRepository.uploadReceipt(file);

    return res.json({ status: 'uploaded', transactionId, receipt: remoteUrl || file.path });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
