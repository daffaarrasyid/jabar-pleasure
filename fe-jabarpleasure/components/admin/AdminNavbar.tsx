'use client';

import React from 'react';
import { Search, Bell, LogOut, Menu } from 'lucide-react';

interface AdminNavbarProps {
  adminName?: string;
  pendingCount?: number;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  onOpenPending?: () => void;
  isScrolled?: boolean;
  className?: string;
}

export default function AdminNavbar({
  adminName = 'Admin123',
  pendingCount = 0,
  onLogout,
  onToggleSidebar,
  onOpenPending,
  isScrolled = false,
  className = '',
}: AdminNavbarProps) {
  return (
    <header
      className={`sticky top-4 z-40 w-full rounded-full px-4 sm:px-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] mb-8 select-none ${
        isScrolled
          ? 'py-2 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-200/90'
          : 'py-2.5 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100'
      } flex items-center justify-between ${className}`}
    >
      {/* Left: Mobile hamburger + Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="group p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-all duration-200 cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5 stroke-[2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-120 group-active:scale-90" />
        </button>

        {/* Search capsule */}
        <div className="group flex items-center gap-2.5 bg-[#F6F7FB] rounded-full px-4 py-2 w-full max-w-xs transition-all focus-within:ring-2 focus-within:ring-[#4941EC]/20 focus-within:bg-white">
          <Search className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-focus-within:scale-115 group-hover:scale-115" />
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
          className="group relative p-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          title={pendingCount > 0 ? `${pendingCount} pengajuan memerlukan validasi` : 'Notifikasi Admin'}
        >
          <Bell className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-active:scale-90" />
          {pendingCount > 0 ? (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold ring-2 ring-white animate-pulse">
              {pendingCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white transition-transform duration-300 group-hover:scale-125" />
          )}
        </button>

        {/* Admin Profile Chip */}
        <div className="group flex items-center gap-2.5 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/admin-avatar.png"
            alt={adminName}
            suppressHydrationWarning
            className="w-8 h-8 rounded-full object-cover border border-gray-200 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 shadow-2xs"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span
              suppressHydrationWarning
              className="text-xs font-semibold text-gray-900 leading-tight group-hover:text-[#4941EC] transition-colors"
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
          className="group p-1.5 text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 stroke-[2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-active:scale-90" />
        </button>
      </div>
    </header>
  );
}
