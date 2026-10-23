'use client';

import React from 'react';
import BrandLogo from '@/components/ui/BrandLogo';
import { Bell } from 'lucide-react';

interface AppHeaderProps {
  unreadNotifications?: number;
  avatarSrc?: string;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export default function AppHeader({
  unreadNotifications = 2,
  avatarSrc = '/user-avatar.jpg',
  onNotificationClick,
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

      {/* Right Action Icons: Notification Bell & Profile Avatar */}
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

        {/* Profile Avatar Button */}
        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Lihat Profil"
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs hover:ring-2 hover:ring-[#4941EC]/30 active:scale-95 transition-all shrink-0 bg-gray-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc}
            alt="Profil Pengguna"
            className="w-full h-full object-cover object-center"
          />
        </button>
      </div>
    </header>
  );
}
