const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Create Razorpay order
router.post('/create-order', authenticate, paymentController.createPaymentOrder);

// Verify signature
router.post('/verify', authenticate, paymentController.verifyPayment);

// Webhook endpoint (raw/json parsed)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
