import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverviewPage } from '../../pages/admin/AdminOverviewPage';
import { AdminOrdersPage } from '../../pages/admin/AdminOrdersPage';
import { AdminPickupScanPage } from '../../pages/admin/AdminPickupScanPage';
import { AdminProductsPage } from '../../pages/admin/AdminProductsPage';
import { AdminInventoryPage } from '../../pages/admin/AdminInventoryPage';
import { AdminSlotsPage } from '../../pages/admin/AdminSlotsPage';
import { AdminReportsPage } from '../../pages/admin/AdminReportsPage';
import { AdminSettingsPage } from '../../pages/admin/AdminSettingsPage';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { ShieldAlert, Bell, Store, ArrowLeft } from 'lucide-react';

export const AdminLayout = ({ onExitAdmin }) => {
  const { user, isStaff, login } = useAuth();
  const { latestNotification } = useSocket();
  const [activeTab, setActiveTab] = useState('overview');

  // If not logged in as staff/admin, display prompt to login as staff
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Staff Authorization Required</h2>
          <p className="text-xs text-slate-400">
            You are currently signed in as a customer ({user?.email || 'Guest'}). Access to store order preparation, scanner, and inventory controls requires Staff or Admin role.
          </p>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => login('staff@quickpick.com', 'Staff@12345')}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-md"
            >
              Sign In as Demo Staff (Rohan)
            </button>
            <button
              onClick={() => login('admin@quickpick.com', 'Admin@12345')}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition"
            >
              Sign In as Demo Admin (Priya)
            </button>
            <button
              onClick={onExitAdmin}
              className="w-full py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition"
            >
              Return to Customer Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabSelect={(tab) => setActiveTab(tab)}
        onExitAdmin={onExitAdmin}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Store Terminal Active</span>
            </span>

            {latestNotification && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 truncate max-w-xs animate-in fade-in">
                <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate font-semibold">{latestNotification.title}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
            >
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <span>View Store Front</span>
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <AdminOverviewPage
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectOrder={(num) => setActiveTab('orders')}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersPage
              onOpenPickupScan={() => setActiveTab('pickup')}
            />
          )}

          {activeTab === 'pickup' && <AdminPickupScanPage />}

          {activeTab === 'products' && <AdminProductsPage />}

          {activeTab === 'inventory' && <AdminInventoryPage />}

          {activeTab === 'slots' && <AdminSlotsPage />}

          {activeTab === 'reports' && <AdminReportsPage />}

          {activeTab === 'settings' && <AdminSettingsPage />}
        </main>
      </div>
    </div>
  );
};
