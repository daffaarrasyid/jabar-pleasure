'use client';

import React, { useEffect, useState } from 'react';
import BrandLogo from '@/components/ui/BrandLogo';
import { Bell, Heart } from 'lucide-react';
import { getUnreadNotificationCount } from '@/lib/api';
import NotificationSheet, { NOTIFICATION_EVENT } from '@/components/notification/NotificationSheet';

interface AppHeaderProps {
  unreadNotifications?: number;
  wishlistCount?: number;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export default function AppHeader({
  unreadNotifications,
  wishlistCount = 0,
  onNotificationClick,
  onWishlistClick,
  onProfileClick,
  className = '',
}: AppHeaderProps) {
  const [liveUnreadCount, setLiveUnreadCount] = useState<number>(unreadNotifications ?? 0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Sync if unreadNotifications prop is explicitly passed
  useEffect(() => {
    if (typeof unreadNotifications === 'number') {
      setLiveUnreadCount(unreadNotifications);
    }
  }, [unreadNotifications]);

  // Fetch unread count on mount and listen to real-time notification events
  useEffect(() => {
    let isMounted = true;

    getUnreadNotificationCount()
      .then((count) => {
        if (isMounted) {
          setLiveUnreadCount(count);
        }
      })
      .catch(() => {});

    const handleNotificationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ unreadCount: number }>;
      if (customEvent.detail && typeof customEvent.detail.unreadCount === 'number') {
        if (isMounted) {
          setLiveUnreadCount(customEvent.detail.unreadCount);
        }
      } else {
        getUnreadNotificationCount()
          .then((count) => {
            if (isMounted) setLiveUnreadCount(count);
          })
          .catch(() => {});
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(NOTIFICATION_EVENT, handleNotificationUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener(NOTIFICATION_EVENT, handleNotificationUpdate);
      }
    };
  }, []);

  const handleBellClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      setIsSheetOpen(true);
    }
  };

  const displayUnread =
    typeof unreadNotifications === 'number'
      ? unreadNotifications
      : liveUnreadCount;

  return (
    <>
      <header
        className={`w-full flex items-center justify-between px-5 pt-3.5 pb-2 bg-white/90 backdrop-blur-md sticky top-0 z-20 select-none min-w-0 ${className}`}
      >
        {/* Brand Droplet Logo */}
        <div className="flex items-center shrink-0">
          <BrandLogo size="sm" showText={false} className="shrink-0" />
        </div>

        {/* Right Action Icons: Symmetrical Notification Bell & Wishlist Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell Button */}
          <button
            type="button"
            onClick={handleBellClick}
            aria-label="Buka Notifikasi"
            className="relative w-10 h-10 rounded-full bg-gray-100/80 hover:bg-[#EEF0FF] active:scale-95 text-gray-700 hover:text-[#4941EC] flex items-center justify-center transition-all shrink-0 cursor-pointer group shadow-2xs hover:shadow-xs"
          >
            <Bell className="w-5 h-5 stroke-[1.9] group-hover:rotate-12 transition-transform duration-200" />
            {displayUnread > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none animate-in fade-in zoom-in-75"
                aria-label={`${displayUnread} notifikasi belum dibaca`}
              >
                {displayUnread > 99 ? '99+' : displayUnread}
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

      {/* Built-in Notification Sheet */}
      <NotificationSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onUnreadCountChange={(count) => setLiveUnreadCount(count)}
        onSelectDestination={() => {
          setIsSheetOpen(false);
          if (typeof window !== 'undefined') {
            window.location.href = '/map';
          }
        }}
      />
    </>
  );
}
