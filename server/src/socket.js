const { Server } = require('socket.io');
const { verifyToken } = require('./utils/jwt');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Optional auth during socket handshake
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        socket.user = decoded;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    // If user is authenticated, join their personal room
    if (socket.user?.userId) {
      socket.join(`user:${socket.user.userId}`);
      if (socket.user.role === 'ADMIN' || socket.user.role === 'STAFF') {
        socket.join('admin');
      }
    }

    // Client can also join a room for a specific order tracking
    socket.on('join:order', (orderNumber) => {
      if (orderNumber) {
        socket.join(`order:${orderNumber}`);
      }
    });

    socket.on('leave:order', (orderNumber) => {
      if (orderNumber) {
        socket.leave(`order:${orderNumber}`);
      }
    });

    // Explicit admin room join if authenticated as staff
    socket.on('join:admin', () => {
      if (socket.user?.role === 'ADMIN' || socket.user?.role === 'STAFF') {
        socket.join('admin');
      }
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitNewOrder = (order) => {
  if (!io) return;
  io.to('admin').emit('order:new', {
    orderNumber: order.orderNumber,
    customerName: order.user?.name || 'Customer',
    totalAmount: order.totalAmount,
    pickupType: order.pickupType,
    status: order.status,
    createdAt: order.createdAt,
    order,
  });
};

const emitOrderStatusUpdate = (order) => {
  if (!io) return;
  const payload = {
    orderNumber: order.orderNumber,
    status: order.status,
    pickupType: order.pickupType,
    estimatedPickupTime: order.estimatedPickupTime,
    order,
  };

  // Broadcast to admin room
  io.to('admin').emit('order:status_updated', payload);

  // Broadcast to order tracking room
  io.to(`order:${order.orderNumber}`).emit('order:status_updated', payload);

  // Broadcast to user room if order belongs to user
  if (order.userId) {
    io.to(`user:${order.userId}`).emit('order:status_updated', payload);
  }
};

const emitPickupReady = (order) => {
  if (!io) return;
  const payload = {
    orderNumber: order.orderNumber,
    pickupToken: order.pickup?.pickupToken,
    qrCodeDataUrl: order.pickup?.qrCodeDataUrl,
    scheduledSlot: order.pickup?.scheduledSlot,
    order,
  };

  io.to('admin').emit('order:ready', payload);
  io.to(`order:${order.orderNumber}`).emit('order:ready', payload);
  if (order.userId) {
    io.to(`user:${order.userId}`).emit('order:ready', payload);
  }
};

const emitOrderCollected = (order) => {
  if (!io) return;
  const payload = {
    orderNumber: order.orderNumber,
    collectedAt: order.pickup?.collectedAt,
    order,
  };

  io.to('admin').emit('order:collected', payload);
  io.to(`order:${order.orderNumber}`).emit('order:collected', payload);
  if (order.userId) {
    io.to(`user:${order.userId}`).emit('order:collected', payload);
  }
};

const emitStockAlert = (product) => {
  if (!io) return;
  io.to('admin').emit('inventory:low_stock', {
    productId: product.id,
    productName: product.name,
    stockQuantity: product.stockQuantity,
    minStockThreshold: product.minStockThreshold,
  });
};

module.exports = {
  initSocket,
  getIO,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitPickupReady,
  emitOrderCollected,
  emitStockAlert,
};
