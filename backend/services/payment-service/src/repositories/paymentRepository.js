const getSupabase = require('../config/supabase');
const fs = require('fs');

async function createTransaction({ amount, method, orderId, receiptPath }) {
  const transactionId = `tx_${Date.now()}`;

  // optionally persist transaction if Supabase configured
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('transactions').insert([
        { id: transactionId, amount, method, order_id: orderId, receipt_path: receiptPath }
      ]);
    } catch (e) {
      // ignore persistence errors for now
    }
  }

  return transactionId;
}

async function uploadReceipt(file) {
  // file: { path, originalname, mimetype }
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const bucket = supabase.storage.from('receipts');
    const fileData = fs.readFileSync(file.path);
    const remotePath = `${Date.now()}_${file.originalname}`;
    const res = await bucket.upload(remotePath, fileData, { contentType: file.mimetype });
    if (res?.error) throw res.error;
    const { publicURL } = supabase.storage.from('receipts').getPublicUrl(remotePath);
    return publicURL;
  } catch (e) {
    // ignore upload errors and return null
    return null;
  }
}

module.exports = { createTransaction, uploadReceipt };
