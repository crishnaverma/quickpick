const { z } = require('zod');

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  unitVariant: z.string().default('default'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1').default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
});

const verifyPickupSchema = z.object({
  pickupToken: z.string().trim().min(4, 'Valid pickup token is required'),
  orderNumber: z.string().trim().optional(),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  verifyPickupSchema,
};
