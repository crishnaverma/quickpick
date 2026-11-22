const { z } = require('zod');

const productSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional().nullable(),
  images: z.union([z.array(z.string()), z.string()]).optional(),
  unitType: z.enum(['FIXED', 'WEIGHT']).default('FIXED'),
  defaultUnit: z.string().trim().min(1, 'Default unit is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  costPrice: z.coerce.number().positive().optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  minStockThreshold: z.coerce.number().int().min(0).default(5),
  isAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  variants: z.any().optional().nullable(),
});

const stockAdjustmentSchema = z.object({
  quantityChange: z.coerce.number().int().refine((val) => val !== 0, 'Quantity change cannot be 0'),
  type: z.enum(['STOCK_IN', 'ADJUSTMENT', 'LOSS']),
  notes: z.string().trim().optional().nullable(),
});

module.exports = {
  productSchema,
  stockAdjustmentSchema,
};
