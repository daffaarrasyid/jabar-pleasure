'use client';

import React from 'react';
import BrandLogo from '@/components/ui/BrandLogo';
import { Bell, Heart } from 'lucide-react';

interface AppHeaderProps {
  unreadNotifications?: number;
  wishlistCount?: number;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export default function AppHeader({
  unreadNotifications = 2,
  wishlistCount = 0,
  onNotificationClick,
  onWishlistClick,
  onProfileClick,
  className = '',
}: AppHeaderProps) {
  return (
    <header
      className={`w-full flex items-center justify-between px-5 pt-3.5 pb-2 bg-white/90 backdrop-blur-md sticky top-0 z-20 select-none min-w-0 ${className}`}
    >
      {/* Brand Droplet Logo */}
      <div className="flex items-center shrink-0">
        <BrandLogo size="sm" showText={false} className="shrink-0" />
      </div>

      {/* Right Action Icons: Notification Bell & Wishlist Button */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell Button */}
        <button
          type="button"
          onClick={onNotificationClick}
          aria-label="Notifikasi"
          className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors active:scale-95 rounded-full hover:bg-gray-100/70"
        >
          <Bell className="w-6 h-6 stroke-[1.8]" />
          {unreadNotifications > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none"
              aria-label={`${unreadNotifications} notifikasi belum dibaca`}
            >
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Wishlist Button (replacing Profile Avatar per user request) */}
        <button
          type="button"
          onClick={onWishlistClick || onProfileClick}
          aria-label="Wishlist Destinasi"
          className="relative w-10 h-10 rounded-full bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white flex items-center justify-center shadow-md shadow-[#4941EC]/30 hover:shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <Heart className="w-5 h-5 stroke-[2.2] text-white" />
          {wishlistCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none animate-in fade-in zoom-in-75"
              aria-label={`${wishlistCount} destinasi di wishlist`}
            >
              {wishlistCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
