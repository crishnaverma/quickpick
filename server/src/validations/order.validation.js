const { z } = require('zod');

const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  unitVariant: z.string().default('default'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
  pickupType: z.enum(['ASAP', 'SCHEDULED']),
  pickupSlotId: z.string().optional().nullable(),
  paymentMethod: z.enum(['RAZORPAY', 'CASH_ON_PICKUP']),
  notes: z.string().trim().max(500).optional().nullable(),
  idempotencyKey: z.string().optional().nullable(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED', 'REJECTED']),
  rejectionReason: z.string().trim().optional().nullable(),
  cancellationReason: z.string().trim().optional().nullable(),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
