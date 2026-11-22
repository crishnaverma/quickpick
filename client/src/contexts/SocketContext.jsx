import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Synthesized audio chimes via standard Web Audio API (zero audio assets required!)
const playChime = (type = 'success') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'order') {
      // Upbeat cheerful chord for new order or order ready
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // Gentle notification ding
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // Audio autoplay restrictions may ignore without user interaction
  }
};

export const SocketProvider = ({ children }) => {
  const { token, user, isStaff } = useAuth();
  const [socket, setSocket] = useState(null);
  const [latestNotification, setLatestNotification] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    const socketInstance = io('/', {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      // If staff/admin, join admin channel
      if (isStaff) {
        socketInstance.emit('join:admin');
      }
    });

    // Listen for new orders (admin/staff view)
    socketInstance.on('order:new', (data) => {
      playChime('order');
      setLatestNotification({
        id: Date.now(),
        type: 'info',
        title: 'New Click & Collect Order!',
        message: `Order #${data.orderNumber} received (${data.pickupType}) - ₹${data.totalAmount}`,
      });
      setActiveAlerts((prev) => [data, ...prev.slice(0, 9)]);
    });

    // Listen for order status updates
    socketInstance.on('order:status_updated', (data) => {
      playChime('info');
      setLatestNotification({
        id: Date.now(),
        type: 'status',
        title: `Order Status: ${data.status}`,
        message: `Order #${data.orderNumber} is now ${data.status.toLowerCase().replace('_', ' ')}`,
      });
    });

    // Listen for ready for collection alert
    socketInstance.on('order:ready', (data) => {
      playChime('order');
      setLatestNotification({
        id: Date.now(),
        type: 'ready',
        title: 'Groceries Ready for Pickup!',
        message: `Your order #${data.orderNumber} is packed and waiting at the counter!`,
      });
    });

    // Listen for low stock warnings
    socketInstance.on('inventory:low_stock', (data) => {
      setLatestNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${data.productName} has only ${data.stockQuantity} units left in stock.`,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, isStaff]);

  const joinOrderRoom = (orderNumber) => {
    if (socket && orderNumber) {
      socket.emit('join:order', orderNumber);
    }
  };

  const leaveOrderRoom = (orderNumber) => {
    if (socket && orderNumber) {
      socket.emit('leave:order', orderNumber);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        latestNotification,
        activeAlerts,
        joinOrderRoom,
        leaveOrderRoom,
        playChime,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
