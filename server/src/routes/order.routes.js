const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { checkoutLimiter } = require('../middleware/rateLimiter.middleware');
const { createOrderSchema } = require('../validations/order.validation');

router.post('/', authenticate, checkoutLimiter, validate(createOrderSchema), orderController.createOrder);
router.get('/', authenticate, orderController.getCustomerOrders);
router.get('/:orderNumber', optionalAuthenticate, orderController.getOrderByNumber);
router.post('/:orderNumber/cancel', authenticate, orderController.cancelOrder);

module.exports = router;
