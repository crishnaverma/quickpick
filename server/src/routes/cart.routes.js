const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const validate = require('../middleware/validate.middleware');
const { optionalAuthenticate } = require('../middleware/auth.middleware');
const { addToCartSchema, updateCartItemSchema } = require('../validations/cart.validation');

router.use(optionalAuthenticate);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addItem);
router.put('/items/:itemId', validate(updateCartItemSchema), cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
