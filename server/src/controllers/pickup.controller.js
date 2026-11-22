const prisma = require('../database/prisma');
const { success, error } = require('../utils/response');
const { parseJsonField } = require('./product.controller');
const { emitOrderCollected, emitOrderStatusUpdate } = require('../socket');

/**
 * 1. Get available pickup time slots for today and tomorrow
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.pickupSlot.findMany({
      where: {
        date: { gte: today },
        isClosed: false,
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    const formattedSlots = slots.map((s) => ({
      id: s.id,
      date: s.date.toISOString().split('T')[0],
      startTime: s.startTime,
      endTime: s.endTime,
      maxOrders: s.maxOrders,
      bookedCount: s.bookedCount,
      remainingCapacity: Math.max(0, s.maxOrders - s.bookedCount),
      isAvailable: s.bookedCount < s.maxOrders && !s.isClosed,
    }));

    return success(res, formattedSlots, 'Available pickup slots fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Verify Customer Pickup Token (from QR code scan or manual token entry)
 */
const verifyPickupToken = async (req, res, next) => {
  try {
    const { pickupToken, orderNumber } = req.body;

    if (!pickupToken) {
      return error(res, 'Pickup token is required for verification.', 400);
    }

    const whereClause = { pickupToken: pickupToken.trim().toUpperCase() };
    if (orderNumber) {
      whereClause.order = { orderNumber: orderNumber.trim() };
    }

    const pickup = await prisma.pickup.findFirst({
      where: whereClause,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, images: true, defaultUnit: true },
                },
              },
            },
            payment: true,
            user: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
      },
    });

    if (!pickup) {
      return error(res, 'Invalid pickup token or order mismatch. Please verify token.', 404);
    }

    const order = pickup.order;

    // Check if already collected to PREVENT DUPLICATE COLLECTION
    if (pickup.status === 'COLLECTED' || order.status === 'COLLECTED') {
      return error(
        res,
        `Duplicate Collection Attempt! Order #${order.orderNumber} was ALREADY COLLECTED on ${new Date(
          pickup.collectedAt
        ).toLocaleString()}.`,
        400,
        {
          orderNumber: order.orderNumber,
          collectedAt: pickup.collectedAt,
          isAlreadyCollected: true,
        }
      );
    }

    // Check if order is in READY state
    if (order.status !== 'READY') {
      return error(
        res,
        `Order #${order.orderNumber} is currently "${order.status}". Groceries can only be handed over when status is READY.`,
        400,
        {
          orderNumber: order.orderNumber,
          status: order.status,
        }
      );
    }

    const formattedOrder = {
      ...order,
      items: order.items.map((it) => ({
        ...it,
        product: it.product ? {
          ...it.product,
          images: parseJsonField(it.product.images, []),
        } : null,
      })),
    };

    return success(res, {
      isValid: true,
      order: formattedOrder,
      pickupStatus: pickup.status,
      paymentStatus: order.payment?.status,
      paymentMethod: order.payment?.method,
      amountDue: order.payment?.status === 'SUCCESS' ? 0 : Number(order.totalAmount),
    }, 'Pickup token verified successfully. Ready for collection.');
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Confirm Collection and Hand Over Groceries
 * Staff scans QR / confirms.
 * Updates order to COLLECTED, records timestamp, records staff ID, transitions payment if cash.
 */
const confirmCollection = async (req, res, next) => {
  try {
    const { pickupToken, notes } = req.body;
    const staffId = req.user?.id;

    if (!pickupToken) {
      return error(res, 'Pickup token is required.', 400);
    }

    const pickup = await prisma.pickup.findUnique({
      where: { pickupToken: pickupToken.trim().toUpperCase() },
      include: {
        order: {
          include: {
            items: true,
            payment: true,
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    if (!pickup) {
      return error(res, 'Pickup record not found.', 404);
    }

    const order = pickup.order;

    if (pickup.status === 'COLLECTED' || order.status === 'COLLECTED') {
      return error(res, `This order has already been collected on ${new Date(pickup.collectedAt).toLocaleString()}`, 400);
    }

    if (order.status !== 'READY') {
      return error(res, `Cannot hand over order. Status is currently ${order.status}, must be READY.`, 400);
    }

    const collectedAt = new Date();

    // Atomic execution of handover
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Mark Pickup as COLLECTED
      await tx.pickup.update({
        where: { id: pickup.id },
        data: {
          status: 'COLLECTED',
          collectedAt,
          collectedByStaffId: staffId || null,
          notes: notes || pickup.notes,
        },
      });

      // 2. Mark Order as COLLECTED
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COLLECTED',
        },
        include: {
          items: true,
          payment: true,
          pickup: true,
          user: { select: { id: true, name: true, phone: true } },
        },
      });

      // 3. If Cash on Pickup and unpaid, mark Payment as SUCCESS (cash received at counter)
      if (order.payment && order.payment.status !== 'SUCCESS') {
        await tx.payment.update({
          where: { orderId: order.id },
          data: {
            status: 'SUCCESS',
          },
        });
      }

      // 4. Convert reservations to finalized SALE movements & deduct stockQuantity
      for (const item of order.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          const newStock = Math.max(0, prod.stockQuantity - item.quantity);
          const newReserved = Math.max(0, (prod.reservedStock || 0) - item.quantity);

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: newStock,
              reservedStock: newReserved,
            },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              orderId: order.id,
              type: 'SALE',
              quantity: -item.quantity,
              balanceAfter: newStock,
              notes: `Order #${order.orderNumber} collected by customer at store counter`,
              createdByStaffId: staffId || null,
            },
          });
        }
      }

      return updated;
    });

    emitOrderCollected(updatedOrder);
    emitOrderStatusUpdate(updatedOrder);

    return success(res, updatedOrder, 'Order marked as COLLECTED. Handover completed successfully!');
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Manual Order Number Lookup (for staff at counter)
 */
const lookupOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, defaultUnit: true },
            },
          },
        },
        payment: true,
        pickup: true,
        pickupSlot: true,
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    if (!order) {
      return error(res, 'No order found with this order number.', 404);
    }

    const formatted = {
      ...order,
      items: order.items.map((it) => ({
        ...it,
        product: it.product ? {
          ...it.product,
          images: parseJsonField(it.product.images, []),
        } : null,
      })),
    };

    return success(res, formatted, 'Order found');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailableSlots,
  verifyPickupToken,
  confirmCollection,
  lookupOrderByNumber,
};
