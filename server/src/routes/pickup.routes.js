const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickup.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { verifyPickupSchema } = require('../validations/cart.validation');

// Public / Customer: view available pickup slots
router.get('/slots', pickupController.getAvailableSlots);

// Staff / Admin: Verify customer pickup token
router.post('/verify', authenticate, authorize('ADMIN', 'STAFF'), validate(verifyPickupSchema), pickupController.verifyPickupToken);

// Staff / Admin: Confirm customer collection
router.post('/confirm', authenticate, authorize('ADMIN', 'STAFF'), pickupController.confirmCollection);

// Staff / Admin: Lookup order by order number
router.get('/lookup/:orderNumber', authenticate, authorize('ADMIN', 'STAFF'), pickupController.lookupOrderByNumber);

module.exports = router;
