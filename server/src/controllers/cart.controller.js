const prisma = require('../database/prisma');
const { success, error } = require('../utils/response');
const { formatProduct, parseJsonField } = require('./product.controller');

// Helper to calculate variant price based on product configuration
const getEffectiveItemPrice = (product, unitVariant) => {
  const basePrice = Number(product.price);
  if (!unitVariant || unitVariant === 'default') {
    return basePrice;
  }

  const variants = parseJsonField(product.variants, []);
  if (Array.isArray(variants)) {
    const match = variants.find((v) => v.label === unitVariant);
    if (match) {
      if (match.price) return Number(match.price);
      if (match.multiplier) return Math.round(basePrice * Number(match.multiplier) * 100) / 100;
    }
  }

  return basePrice;
};

// Helper to get or create cart for user
const getOrCreateCart = async (userId, sessionToken) => {
  let cart;
  if (userId) {
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
      });
    }
  } else if (sessionToken) {
    cart = await prisma.cart.findUnique({
      where: { sessionToken },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionToken },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
      });
    }
  }
  return cart;
};

// Format cart output with live calculations and stock validation
const formatCartResponse = (cart) => {
  let subtotal = 0;
  let totalItemsCount = 0;
  let hasStockIssues = false;

  const items = (cart.items || []).map((item) => {
    const product = item.product;
    const currentPrice = getEffectiveItemPrice(product, item.unitVariant);
    const itemTotal = Math.round(currentPrice * item.quantity * 100) / 100;
    subtotal += itemTotal;
    totalItemsCount += item.quantity;

    const availableStock = Math.max(0, product.stockQuantity - (product.reservedStock || 0));
    const isOutOfStock = !product.isActive || !product.isAvailable || availableStock <= 0;
    const isExceedingStock = item.quantity > availableStock;

    if (isOutOfStock || isExceedingStock) {
      hasStockIssues = true;
    }

    return {
      id: item.id,
      productId: item.productId,
      name: product.name,
      slug: product.slug,
      defaultUnit: product.defaultUnit,
      unitVariant: item.unitVariant,
      unitPrice: currentPrice,
      quantity: item.quantity,
      itemTotal,
      images: parseJsonField(product.images, []),
      availableStock,
      isOutOfStock,
      isExceedingStock,
    };
  });

  const taxRate = 0.05; // 5% GST
  const estimatedTax = Math.round(subtotal * taxRate * 100) / 100;
  const estimatedTotal = Math.round((subtotal + estimatedTax) * 100) / 100;

  return {
    id: cart.id,
    items,
    itemCount: totalItemsCount,
    subtotal: Math.round(subtotal * 100) / 100,
    estimatedTax,
    estimatedTotal,
    hasStockIssues,
  };
};

const getCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionToken = req.headers['x-session-token'];

    if (!userId && !sessionToken) {
      return success(res, {
        id: null,
        items: [],
        itemCount: 0,
        subtotal: 0,
        estimatedTax: 0,
        estimatedTotal: 0,
        hasStockIssues: false,
      });
    }

    const cart = await getOrCreateCart(userId, sessionToken);
    return success(res, formatCartResponse(cart), 'Cart retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionToken = req.headers['x-session-token'];
    const { productId, unitVariant = 'default', quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return error(res, 'Product is unavailable.', 404);
    }

    const availableStock = Math.max(0, product.stockQuantity - (product.reservedStock || 0));
    if (availableStock <= 0) {
      return error(res, `${product.name} is currently out of stock.`, 400);
    }

    const cart = await getOrCreateCart(userId, sessionToken);
    if (!cart) {
      return error(res, 'Unable to locate or create cart.', 400);
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_unitVariant: {
          cartId: cart.id,
          productId,
          unitVariant,
        },
      },
    });

    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (newQuantity > availableStock) {
      return error(res, `Cannot add more. Only ${availableStock} units available in stock.`, 400);
    }

    const effectivePrice = getEffectiveItemPrice(product, unitVariant);

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          priceSnapshot: effectivePrice,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          unitVariant,
          quantity,
          priceSnapshot: effectivePrice,
        },
      });
    }

    const updatedCart = await getOrCreateCart(userId, sessionToken);
    return success(res, formatCartResponse(updatedCart), 'Item added to cart');
  } catch (err) {
    next(err);
  }
};

const updateItemQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionToken = req.headers['x-session-token'];

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!item) {
      return error(res, 'Cart item not found', 404);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      const availableStock = Math.max(0, item.product.stockQuantity - (item.product.reservedStock || 0));
      if (quantity > availableStock) {
        return error(res, `Only ${availableStock} units available in stock.`, 400);
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    const updatedCart = await getOrCreateCart(userId, sessionToken);
    return success(res, formatCartResponse(updatedCart), 'Cart updated');
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const sessionToken = req.headers['x-session-token'];

    await prisma.cartItem.delete({
      where: { id: itemId },
    }).catch(() => null);

    const updatedCart = await getOrCreateCart(userId, sessionToken);
    return success(res, formatCartResponse(updatedCart), 'Item removed from cart');
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionToken = req.headers['x-session-token'];

    const cart = await getOrCreateCart(userId, sessionToken);
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return success(res, { items: [], itemCount: 0, subtotal: 0, estimatedTotal: 0 }, 'Cart cleared');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  getEffectiveItemPrice,
};
