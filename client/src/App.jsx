import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { CartDrawer } from './components/common/CartDrawer';
import { ToastNotification } from './components/common/ToastNotification';
import { HomePage } from './pages/customer/HomePage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage';
import { AdminLayout } from './components/admin/AdminLayout';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState(() => window.location.hash || '#home');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      setCurrentRoute(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (hash) => {
    window.location.hash = hash;
  };

  // Route parser
  const isAdminRoute = currentRoute.startsWith('#admin');
  const isCheckoutRoute = currentRoute === '#checkout';
  const isOrdersHistoryRoute = currentRoute === '#orders';
  const isOrderTrackingRoute = currentRoute.startsWith('#order/');
  const trackingOrderNumber = isOrderTrackingRoute ? currentRoute.replace('#order/', '') : null;

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-900">
        <AdminLayout onExitAdmin={() => navigateTo('#home')} />
        <ToastNotification />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
      {/* Customer Navigation Bar */}
      <Navbar
        currentSearch={searchQuery}
        onSearch={(query) => {
          setSearchQuery(query);
          navigateTo('#home');
        }}
        currentCategory={categoryFilter}
        onCategorySelect={(cat) => {
          setCategoryFilter(cat);
          navigateTo('#home');
        }}
      />

      {/* Main Customer Views */}
      <main className="flex-1">
        {isCheckoutRoute ? (
          <CheckoutPage
            onOrderPlaced={(orderNum) => navigateTo(`#order/${orderNum}`)}
            onBackToShopping={() => navigateTo('#home')}
          />
        ) : isOrderTrackingRoute ? (
          <OrderTrackingPage
            orderNumber={trackingOrderNumber}
            onBackToOrders={() => navigateTo('#orders')}
            onReorderSuccess={() => navigateTo('#home')}
          />
        ) : isOrdersHistoryRoute ? (
          <OrderHistoryPage
            onSelectOrder={(orderNum) => navigateTo(`#order/${orderNum}`)}
            onStartShopping={() => navigateTo('#home')}
          />
        ) : (
          <HomePage
            currentSearch={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            currentCategory={categoryFilter}
            onCategoryChange={(cat) => setCategoryFilter(cat)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals & Drawers */}
      <AuthModal />
      <CartDrawer onNavigateCheckout={() => navigateTo('#checkout')} />
      <ToastNotification />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
