const express = require('express');
const router = express.Router();
const multer = require('multer');
const paymentController = require('../controllers/paymentController');

const upload = multer({ dest: 'uploads/' });

router.get('/health', paymentController.health);
router.post('/pay', paymentController.pay);
router.post('/upload-receipt', upload.single('receipt'), paymentController.uploadReceipt);

module.exports = router;
