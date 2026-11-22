const prisma = require('../database/prisma');
const { success, error } = require('../utils/response');
const { generateOrderNumber } = require('../utils/orderNumber');
const { generatePickupToken, generatePickupQRCode } = require('../utils/qr');
const { getEffectiveItemPrice } = require('./cart.controller');
const { parseJsonField, formatProduct } = require('./product.controller');
const { emitNewOrder, emitOrderStatusUpdate } = require('../socket');

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      items: inputItems,
      pickupType,
      pickupSlotId,
      paymentMethod,
      notes,
      idempotencyKey,
    } = req.body;

    // 1. Idempotency Check to prevent duplicate order submissions
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: {
          items: true,
          payment: true,
          pickup: true,
          pickupSlot: true,
        },
      });
      if (existingOrder) {
        return success(res, existingOrder, 'Order already placed (idempotent result)');
      }
    }

    // 2. Fetch Shop Settings
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { id: 'shop-settings-primary' },
    });

    if (shopSettings && !shopSettings.isShopOpen) {
      return error(res, 'The store is currently closed for online orders. Please check back during operating hours.', 400);
    }

    if (pickupType === 'ASAP' && shopSettings && !shopSettings.acceptAsap) {
      return error(res, 'ASAP pickup is temporarily unavailable due to high store rush. Please select a scheduled pickup time.', 400);
    }

    // 3. Validate Pickup Slot if Scheduled
    let scheduledSlotRecord = null;
    let slotDisplayString = 'ASAP (Est. 15-20 min)';
    let estimatedPickupTime = new Date(Date.now() + 20 * 60 * 1000);

    if (pickupType === 'SCHEDULED') {
      if (!pickupSlotId) {
        return error(res, 'Please select a pickup time slot for scheduled collection.', 400);
      }

      scheduledSlotRecord = await prisma.pickupSlot.findUnique({
        where: { id: pickupSlotId },
      });

      if (!scheduledSlotRecord || scheduledSlotRecord.isClosed) {
        return error(res, 'The selected pickup slot is no longer available. Please choose another time.', 400);
      }

      if (scheduledSlotRecord.bookedCount >= scheduledSlotRecord.maxOrders) {
        return error(res, 'The selected pickup slot has reached full capacity. Please select an alternate slot.', 400);
      }

      slotDisplayString = `${scheduledSlotRecord.startTime} - ${scheduledSlotRecord.endTime}`;
      
      // Calculate estimated time from slot date & startTime
      const slotDate = new Date(scheduledSlotRecord.date);
      const [hours, minutes] = scheduledSlotRecord.startTime.split(':').map(Number);
      slotDate.setHours(hours, minutes, 0, 0);
      estimatedPickupTime = slotDate;
    }

    // 4. Execute atomic transaction for inventory verification, reservation & order creation
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Collect product IDs
      const productIds = inputItems.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map();
      products.forEach((p) => productMap.set(p.id, p));

      let calculatedSubtotal = 0;
      const orderItemsToCreate = [];
      const stockReservationUpdates = [];

      for (const item of inputItems) {
        const product = productMap.get(item.productId);
        if (!product || !product.isActive || !product.isAvailable) {
          throw new Error(`Product "${product ? product.name : 'Unknown'}" is unavailable.`);
        }

        const availableStock = product.stockQuantity - (product.reservedStock || 0);
        if (item.quantity > availableStock) {
          throw new Error(
            `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${Math.max(0, availableStock)}`
          );
        }

        // BACKEND PRICE CALCULATION (never trust frontend)
        const unitPrice = getEffectiveItemPrice(product, item.unitVariant);
        const itemTotalPrice = Math.round(unitPrice * item.quantity * 100) / 100;
        calculatedSubtotal += itemTotalPrice;

        orderItemsToCreate.push({
          productId: product.id,
          productName: product.name,
          productUnit: product.defaultUnit,
          unitVariant: item.unitVariant || 'default',
          quantity: item.quantity,
          unitPrice,
          totalPrice: itemTotalPrice,
        });

        stockReservationUpdates.push({
          productId: product.id,
          quantity: item.quantity,
          currentStock: product.stockQuantity,
          currentReserved: product.reservedStock || 0,
        });
      }

      calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;

      // Minimum order amount check
      const minOrder = Number(shopSettings?.minOrderAmount || 99);
      if (calculatedSubtotal < minOrder) {
        throw new Error(`Minimum order subtotal is ₹${minOrder.toFixed(2)}. Your subtotal is ₹${calculatedSubtotal.toFixed(2)}.`);
      }

      // Tax calculation (5% GST)
      const taxRate = Number(shopSettings?.taxRate || 0.05);
      const taxTotal = Math.round(calculatedSubtotal * taxRate * 100) / 100;
      const totalAmount = Math.round((calculatedSubtotal + taxTotal) * 100) / 100;

      // Unique Order Number
      const orderNumber = generateOrderNumber();

      // Secure Pickup Token & QR Code
      const pickupToken = generatePickupToken();
      const qrCodeDataUrl = await generatePickupQRCode(orderNumber, pickupToken);

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          pickupSlotId: scheduledSlotRecord ? scheduledSlotRecord.id : null,
          status: 'PLACED',
          pickupType,
          estimatedPickupTime,
          idempotencyKey: idempotencyKey || null,
          subtotal: calculatedSubtotal,
          taxTotal,
          discountTotal: 0,
          totalAmount,
          notes: notes || null,
          items: {
            create: orderItemsToCreate,
          },
          payment: {
            create: {
              method: paymentMethod,
              status: 'PENDING',
              amount: totalAmount,
              currency: 'INR',
              razorpayOrderId: paymentMethod === 'RAZORPAY' ? `order_mock_${orderNumber.replace(/[^A-Za-z0-9]/g, '')}` : null,
            },
          },
          pickup: {
            create: {
              pickupToken,
              qrCodeDataUrl,
              status: 'PENDING',
              scheduledSlot: slotDisplayString,
              estimatedTime: estimatedPickupTime,
            },
          },
        },
        include: {
          items: true,
          payment: true,
          pickup: true,
          pickupSlot: true,
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      });

      // Update reserved stock & record inventory movement for each product
      for (const update of stockReservationUpdates) {
        await tx.product.update({
          where: { id: update.productId },
          data: {
            reservedStock: { increment: update.quantity },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: update.productId,
            orderId: newOrder.id,
            type: 'RESERVATION',
            quantity: -update.quantity,
            balanceAfter: update.currentStock - (update.currentReserved + update.quantity),
            notes: `Reserved for Order #${newOrder.orderNumber}`,
          },
        });
      }

      // If scheduled slot, increment booked count
      if (scheduledSlotRecord) {
        await tx.pickupSlot.update({
          where: { id: scheduledSlotRecord.id },
          data: { bookedCount: { increment: 1 } },
        });
      }

      // Clear customer's cart
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      return newOrder;
    });

    // 5. Emit real-time notification to store staff / admin
    emitNewOrder(createdOrder);

    return success(res, createdOrder, 'Order placed successfully', 201);
  } catch (err) {
    console.error('Order creation failed:', err.message);
    return error(res, err.message, 400);
  }
};

const getCustomerOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 15 } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((o) => ({
      ...o,
      items: o.items.map((it) => ({
        ...it,
        product: it.product ? {
          ...it.product,
          images: parseJsonField(it.product.images, []),
        } : null,
      })),
    }));

    return success(res, {
      orders: formattedOrders,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
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
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return error(res, 'Order not found', 404);
    }

    // Security check: only order owner or staff/admin can view full details
    if (userRole !== 'ADMIN' && userRole !== 'STAFF' && order.userId !== userId) {
      return error(res, 'Unauthorized to view this order', 403);
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

    return success(res, formatted, 'Order details retrieved');
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        payment: true,
        pickup: true,
      },
    });

    if (!order) {
      return error(res, 'Order not found', 404);
    }

    if (order.userId !== userId) {
      return error(res, 'You do not have permission to cancel this order', 403);
    }

    // Only orders in PLACED state can be self-cancelled by customers
    if (order.status !== 'PLACED') {
      return error(
        res,
        `Cannot cancel order. The store is already preparing or has finalized your order (${order.status}). Please call store support.`,
        400
      );
    }

    // Atomic release of reserved stock and cancellation
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Release reserved stock for each item
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const newReserved = Math.max(0, (product.reservedStock || 0) - item.quantity);
          await tx.product.update({
            where: { id: item.productId },
            data: { reservedStock: newReserved },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              orderId: order.id,
              type: 'RELEASE',
              quantity: item.quantity,
              balanceAfter: product.stockQuantity - newReserved,
              notes: `Stock reservation released upon order cancellation: ${reason}`,
            },
          });
        }
      }

      // 2. Decrement slot booked count if scheduled
      if (order.pickupSlotId) {
        await tx.pickupSlot.update({
          where: { id: order.pickupSlotId },
          data: { bookedCount: { decrement: 1 } },
        });
      }

      // 3. Update Order and Pickup status
      const cancelled = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          pickup: {
            update: {
              status: 'EXPIRED',
              notes: `Order cancelled: ${reason}`,
            },
          },
        },
        include: {
          items: true,
          payment: true,
          pickup: true,
          user: { select: { id: true, name: true, phone: true } },
        },
      });

      return cancelled;
    });

    emitOrderStatusUpdate(updatedOrder);

    return success(res, updatedOrder, 'Order cancelled successfully and inventory released');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderByNumber,
  cancelOrder,
};
