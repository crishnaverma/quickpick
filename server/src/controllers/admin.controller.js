const prisma = require('../database/prisma');
const { success, error } = require('../utils/response');
const { parseJsonField, formatProduct } = require('./product.controller');
const { emitOrderStatusUpdate, emitPickupReady, emitStockAlert } = require('../socket');

/**
 * 1. Overview Dashboard Stats & Charts
 */
const getOverviewStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch aggregates in parallel
    const [
      todayOrders,
      pendingOrdersCount,
      readyOrdersCount,
      totalProductsCount,
      allProducts,
      recentOrders,
      last7DaysOrders,
    ] = await Promise.all([
      // Today's orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { notIn: ['CANCELLED', 'REJECTED'] },
        },
        select: { totalAmount: true },
      }),

      // Pending orders
      prisma.order.count({
        where: { status: { in: ['PLACED', 'ACCEPTED', 'PREPARING'] } },
      }),

      // Ready for collection
      prisma.order.count({
        where: { status: 'READY' },
      }),

      // Total products
      prisma.product.count({ where: { isActive: true } }),

      // All active products for low stock analysis
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          reservedStock: true,
          minStockThreshold: true,
          defaultUnit: true,
          category: { select: { name: true } },
        },
      }),

      // 6 most recent orders
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, phone: true } },
          payment: { select: { method: true, status: true } },
          items: { select: { quantity: true, productName: true } },
        },
      }),

      // Orders for the last 7 days chart
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          status: { notIn: ['CANCELLED', 'REJECTED'] },
        },
        select: {
          totalAmount: true,
          createdAt: true,
          status: true,
        },
      }),
    ]);

    const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const todayOrdersCount = todayOrders.length;

    // Filter low stock products
    const lowStockProducts = allProducts.filter((p) => {
      const available = p.stockQuantity - (p.reservedStock || 0);
      return available <= p.minStockThreshold;
    });

    // Aggregate last 7 days sales by day
    const salesByDayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      salesByDayMap[dateKey] = { date: dateKey, sales: 0, orders: 0 };
    }

    last7DaysOrders.forEach((o) => {
      const day = o.createdAt.toISOString().split('T')[0];
      if (salesByDayMap[day]) {
        salesByDayMap[day].sales += Number(o.totalAmount);
        salesByDayMap[day].orders += 1;
      }
    });

    const salesTrend = Object.values(salesByDayMap).map((d) => ({
      ...d,
      sales: Math.round(d.sales * 100) / 100,
    }));

    return success(res, {
      metrics: {
        todaySales: Math.round(todaySales * 100) / 100,
        todayOrdersCount,
        pendingOrdersCount,
        readyOrdersCount,
        totalProductsCount,
        lowStockCount: lowStockProducts.length,
      },
      lowStockAlerts: lowStockProducts.slice(0, 8),
      recentOrders,
      salesTrend,
    }, 'Overview stats fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Order Management: List with filters & pagination
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, pickupType, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (pickupType && pickupType !== 'ALL') {
      where.pickupType = pickupType;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { phone: { contains: search } } },
      ];
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
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formatted = orders.map((o) => ({
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
      orders: formatted,
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

/**
 * 3. Update Order Status (PLACED -> ACCEPTED -> PREPARING -> READY -> COLLECTED / REJECTED)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, rejectionReason, estimatedMinutes } = req.body;
    const staffId = req.user?.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        pickup: true,
        payment: true,
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!order) {
      return error(res, 'Order not found', 404);
    }

    // Handle rejection / cancellation: release inventory back
    if (status === 'REJECTED' || status === 'CANCELLED') {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Release reserved stock
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
                notes: `Stock released due to order ${status}: ${rejectionReason || 'Staff updated'}`,
                createdByStaffId: staffId || null,
              },
            });
          }
        }

        // Decrement slot bookedCount
        if (order.pickupSlotId) {
          await tx.pickupSlot.update({
            where: { id: order.pickupSlotId },
            data: { bookedCount: { decrement: 1 } },
          });
        }

        return await tx.order.update({
          where: { id: order.id },
          data: {
            status,
            rejectionReason: rejectionReason || null,
            pickup: {
              update: {
                status: 'EXPIRED',
                notes: `Order ${status}: ${rejectionReason || 'Staff decision'}`,
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
      });

      emitOrderStatusUpdate(updatedOrder);
      return success(res, updatedOrder, `Order marked as ${status}`);
    }

    // Calculate updated estimated pickup time if provided
    let newEstimatedTime = order.estimatedPickupTime;
    if (estimatedMinutes && Number(estimatedMinutes) > 0) {
      newEstimatedTime = new Date(Date.now() + Number(estimatedMinutes) * 60 * 1000);
    }

    const isMarkingReady = status === 'READY';
    const readyAt = isMarkingReady ? new Date() : order.pickup?.readyAt;

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        estimatedPickupTime: newEstimatedTime,
        pickup: {
          update: {
            status: isMarkingReady ? 'READY' : order.pickup?.status,
            readyAt,
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

    emitOrderStatusUpdate(updatedOrder);

    if (isMarkingReady) {
      emitPickupReady(updatedOrder);
    }

    return success(res, updatedOrder, `Order status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Product Management: CRUD
 */
const createProduct = async (req, res, next) => {
  try {
    const data = req.body;

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return error(res, 'A product with this slug already exists. Please choose a distinct name or slug.', 409);
    }

    const imagesStr = typeof data.images === 'string' ? data.images : JSON.stringify(data.images || []);
    const variantsStr = data.variants ? (typeof data.variants === 'string' ? data.variants : JSON.stringify(data.variants)) : null;

    const product = await prisma.product.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description || null,
        images: imagesStr,
        unitType: data.unitType || 'FIXED',
        defaultUnit: data.defaultUnit,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        costPrice: data.costPrice || null,
        stockQuantity: data.stockQuantity || 0,
        reservedStock: 0,
        minStockThreshold: data.minStockThreshold || 5,
        isAvailable: data.isAvailable !== false,
        isActive: data.isActive !== false,
        variants: variantsStr,
      },
      include: { category: true },
    });

    if (data.stockQuantity > 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          type: 'STOCK_IN',
          quantity: data.stockQuantity,
          balanceAfter: data.stockQuantity,
          notes: 'Initial product creation stock load',
          createdByStaffId: req.user?.id || null,
        },
      });
    }

    return success(res, formatProduct(product), 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const data = req.body;

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return error(res, 'Product not found', 404);
    }

    const imagesStr = data.images !== undefined ? (typeof data.images === 'string' ? data.images : JSON.stringify(data.images)) : undefined;
    const variantsStr = data.variants !== undefined ? (data.variants ? (typeof data.variants === 'string' ? data.variants : JSON.stringify(data.variants)) : null) : undefined;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(imagesStr !== undefined && { images: imagesStr }),
        ...(data.unitType && { unitType: data.unitType }),
        ...(data.defaultUnit && { defaultUnit: data.defaultUnit }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.minStockThreshold !== undefined && { minStockThreshold: data.minStockThreshold }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(variantsStr !== undefined && { variants: variantsStr }),
      },
      include: { category: true },
    });

    return success(res, formatProduct(updated), 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Soft delete: deactivate product to maintain relational history
    const deactivated = await prisma.product.update({
      where: { id: productId },
      data: { isActive: false, isAvailable: false },
    });

    return success(res, deactivated, 'Product deactivated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Inventory Management: List, adjust & view movement logs
 */
const getInventory = async (req, res, next) => {
  try {
    const { search, lowStockOnly, categoryId } = req.query;

    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search };

    const products = await prisma.product.findMany({
      where,
      orderBy: { stockQuantity: 'asc' },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    let formatted = products.map((p) => {
      const available = Math.max(0, p.stockQuantity - (p.reservedStock || 0));
      return {
        ...formatProduct(p),
        availableStock: available,
        isLowStock: available <= p.minStockThreshold,
      };
    });

    if (lowStockOnly === 'true' || lowStockOnly === true) {
      formatted = formatted.filter((p) => p.isLowStock);
    }

    return success(res, formatted, 'Inventory fetched successfully');
  } catch (err) {
    next(err);
  }
};

const adjustInventory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantityChange, type, notes } = req.body;
    const staffId = req.user?.id;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return error(res, 'Product not found', 404);
    }

    const change = parseInt(quantityChange, 10);
    const newStock = Math.max(0, product.stockQuantity + change);

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newStock },
        include: { category: true },
      });

      await tx.inventoryMovement.create({
        data: {
          productId,
          type: type || (change > 0 ? 'STOCK_IN' : 'ADJUSTMENT'),
          quantity: change,
          balanceAfter: newStock,
          notes: notes || 'Manual inventory adjustment',
          createdByStaffId: staffId || null,
        },
      });

      return prod;
    });

    const available = Math.max(0, updatedProduct.stockQuantity - (updatedProduct.reservedStock || 0));
    if (available <= updatedProduct.minStockThreshold) {
      emitStockAlert(updatedProduct);
    }

    return success(res, formatProduct(updatedProduct), 'Inventory adjusted successfully');
  } catch (err) {
    next(err);
  }
};

const getInventoryMovements = async (req, res, next) => {
  try {
    const { productId, limit = 30 } = req.query;

    const where = {};
    if (productId) where.productId = productId;

    const movements = await prisma.inventoryMovement.findMany({
      where,
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, defaultUnit: true } },
        staff: { select: { id: true, name: true } },
      },
    });

    return success(res, movements, 'Inventory movements fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Pickup Slot Management: view, toggle & generate
 */
const getAdminSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const slots = await prisma.pickupSlot.findMany({
      where: {
        date: { gte: targetDate, lt: nextDay },
      },
      orderBy: { startTime: 'asc' },
    });

    return success(res, slots, 'Pickup slots fetched');
  } catch (err) {
    next(err);
  }
};

const toggleSlotStatus = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const slot = await prisma.pickupSlot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return error(res, 'Slot not found', 404);
    }

    const updated = await prisma.pickupSlot.update({
      where: { id: slotId },
      data: { isClosed: !slot.isClosed },
    });

    return success(res, updated, `Slot ${updated.isClosed ? 'closed' : 'opened'} successfully`);
  } catch (err) {
    next(err);
  }
};

/**
 * 7. Reports: Sales, Best-Sellers, Payment Methods
 */
const getReports = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orders, orderItems] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ['CANCELLED', 'REJECTED'] },
        },
        include: { payment: true },
      }),
      prisma.orderItem.findMany({
        where: {
          createdAt: { gte: startDate },
          order: { status: { notIn: ['CANCELLED', 'REJECTED'] } },
        },
        include: {
          product: { select: { name: true, categoryId: true } },
        },
      }),
    ]);

    // Payment method breakdown
    const paymentMethods = {
      RAZORPAY: { count: 0, amount: 0 },
      CASH_ON_PICKUP: { count: 0, amount: 0 },
    };

    let totalRevenue = 0;
    orders.forEach((o) => {
      const amt = Number(o.totalAmount);
      totalRevenue += amt;
      const method = o.payment?.method || 'CASH_ON_PICKUP';
      if (!paymentMethods[method]) paymentMethods[method] = { count: 0, amount: 0 };
      paymentMethods[method].count += 1;
      paymentMethods[method].amount += amt;
    });

    // Best-selling products aggregation
    const productSalesMap = {};
    orderItems.forEach((item) => {
      const pId = item.productId;
      if (!productSalesMap[pId]) {
        productSalesMap[pId] = {
          productId: pId,
          productName: item.productName,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      productSalesMap[pId].totalQuantity += item.quantity;
      productSalesMap[pId].totalRevenue += Number(item.totalPrice);
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    return success(res, {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
      },
      paymentMethods,
      topSellingProducts,
    }, 'Reports fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * 8. Shop Settings: Get & Update
 */
const getShopSettings = async (req, res, next) => {
  try {
    let settings = await prisma.shopSettings.findUnique({
      where: { id: 'shop-settings-primary' },
    });
    if (!settings) {
      settings = await prisma.shopSettings.create({
        data: { id: 'shop-settings-primary' },
      });
    }
    return success(res, settings, 'Shop settings fetched');
  } catch (err) {
    next(err);
  }
};

const updateShopSettings = async (req, res, next) => {
  try {
    const data = req.body;

    const updated = await prisma.shopSettings.upsert({
      where: { id: 'shop-settings-primary' },
      update: data,
      create: {
        id: 'shop-settings-primary',
        ...data,
      },
    });

    return success(res, updated, 'Shop settings updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverviewStats,
  getOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventory,
  adjustInventory,
  getInventoryMovements,
  getAdminSlots,
  toggleSlotStatus,
  getReports,
  getShopSettings,
  updateShopSettings,
};
