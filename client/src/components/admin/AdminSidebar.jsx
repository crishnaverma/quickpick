import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  QrCode,
  Layers,
  Archive,
  Calendar,
  BarChart3,
  Settings,
  ArrowLeft,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminSidebar = ({ activeTab, onTabSelect, onExitAdmin }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders Board', icon: ShoppingBag },
    { id: 'pickup', label: 'Pickup Desk & QR', icon: QrCode },
    { id: 'products', label: 'Product Catalogue', icon: Layers },
    { id: 'inventory', label: 'Stock & Inventory', icon: Archive },
    { id: 'slots', label: 'Time Slot Limits', icon: Calendar },
    { id: 'reports', label: 'Reports & Sales', icon: BarChart3 },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              QP
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">QuickPick Store</h2>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Staff Operations
              </span>
            </div>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff'}</p>
            <p className="text-[10px] text-amber-300 font-mono capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
        </div>

        {/* Menu Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation: Back to Customer Front & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition text-left"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer Store</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
