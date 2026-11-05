'use client';

import React from 'react';
import BrandLogo from '@/components/ui/BrandLogo';
import { Menu, LogOut, ShieldCheck, User } from 'lucide-react';

interface AdminNavbarProps {
  adminName?: string;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  className?: string;
}

export default function AdminNavbar({
  adminName = 'Admin (Jawa Barat)',
  onLogout,
  onToggleSidebar,
  className = '',
}: AdminNavbarProps) {
  return (
    <header
      className={`w-full h-16 bg-white border-b border-gray-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none ${className}`}
    >
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Logo and System Title */}
        <div className="flex items-center gap-2.5">
          <BrandLogo size="sm" showText={false} variant="primary" />
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              JabarPleasure
            </span>
            <span className="hidden sm:inline-block text-gray-300">|</span>
            <h1 className="text-xs sm:text-sm font-semibold text-gray-600 hidden sm:inline-block">
              Dashboard Admin WebGIS
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#4941EC] text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#4941EC]" />
              Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* Right: Admin Profile and Logout */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Profile Pill */}
        <div className="flex items-center gap-2 py-1 px-2.5 sm:px-3 rounded-full bg-gray-50 border border-gray-200/80">
          <div className="w-6 h-6 rounded-full bg-[#4941EC] text-white flex items-center justify-center text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-gray-800 hidden xs:inline-block max-w-[130px] sm:max-w-none truncate">
            {adminName}
          </span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-100 transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Keluar dari akun admin"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

