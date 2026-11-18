'use client';

import React from 'react';
import { Search, Bell, LogOut, Menu } from 'lucide-react';

interface AdminNavbarProps {
  adminName?: string;
  pendingCount?: number;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  onOpenPending?: () => void;
  className?: string;
}

export default function AdminNavbar({
  adminName = 'Admin123',
  pendingCount = 0,
  onLogout,
  onToggleSidebar,
  onOpenPending,
  className = '',
}: AdminNavbarProps) {
  return (
    <header
      className={`w-full bg-white rounded-full px-4 sm:px-6 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-between mb-8 select-none ${className}`}
    >
      {/* Left: Mobile hamburger + Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Search capsule */}
        <div className="flex items-center gap-2.5 bg-[#F6F7FB] rounded-full px-4 py-2 w-full max-w-xs transition-all focus-within:ring-2 focus-within:ring-[#4941EC]/20 focus-within:bg-white">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search...."
            className="bg-transparent text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Right: Notification Bell + Admin Profile + Logout */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        {/* Notification Bell with badge */}
        <button
          type="button"
          onClick={onOpenPending}
          className="relative p-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          title={pendingCount > 0 ? `${pendingCount} pengajuan memerlukan validasi` : 'Notifikasi Admin'}
        >
          <Bell className="w-5 h-5" />
          {pendingCount > 0 ? (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold ring-2 ring-white animate-pulse">
              {pendingCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </button>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/admin-avatar.png"
            alt={adminName}
            suppressHydrationWarning
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span
              suppressHydrationWarning
              className="text-xs font-bold text-gray-900 leading-tight"
            >
              {adminName}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight">
              Administrator
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          title="Keluar dari akun admin"
          className="p-1.5 text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 stroke-[2]" />
        </button>
      </div>
    </header>
  );
}
