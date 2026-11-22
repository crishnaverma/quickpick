const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { productSchema, stockAdjustmentSchema } = require('../validations/product.validation');
const { updateOrderStatusSchema } = require('../validations/order.validation');

// Require STAFF or ADMIN for all admin dashboard routes
router.use(authenticate, authorize('ADMIN', 'STAFF'));

// 1. Overview
router.get('/overview', adminController.getOverviewStats);

// 2. Orders
router.get('/orders', adminController.getOrders);
router.put('/orders/:orderId/status', validate(updateOrderStatusSchema), adminController.updateOrderStatus);

// 3. Products
router.post('/products', validate(productSchema), adminController.createProduct);
router.put('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);

// 4. Inventory
router.get('/inventory', adminController.getInventory);
router.post('/inventory/:productId/adjust', validate(stockAdjustmentSchema), adminController.adjustInventory);
router.get('/inventory/movements', adminController.getInventoryMovements);

// 5. Pickup Slots
router.get('/slots', adminController.getAdminSlots);
router.patch('/slots/:slotId/toggle', adminController.toggleSlotStatus);

// 6. Reports (Admin only)
router.get('/reports', authorize('ADMIN'), adminController.getReports);

// 7. Store Settings (Admin only for updates)
router.get('/settings', adminController.getShopSettings);
router.put('/settings', authorize('ADMIN'), adminController.updateShopSettings);

module.exports = router;
