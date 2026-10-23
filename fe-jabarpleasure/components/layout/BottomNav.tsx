'use client';

import React from 'react';
import { Home, Compass, Bookmark, User } from 'lucide-react';

export type NavTabId = 'beranda' | 'peta' | 'favorit' | 'profil';

interface BottomNavProps {
  activeTab?: NavTabId;
  onTabChange?: (tab: NavTabId) => void;
  badges?: Partial<Record<NavTabId, number>>;
  className?: string;
}

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'peta', label: 'Peta', icon: Compass },
  { id: 'favorit', label: 'Favorit', icon: Bookmark },
  { id: 'profil', label: 'Profil', icon: User },
];

export default function BottomNav({
  activeTab = 'beranda',
  onTabChange,
  badges,
  className = '',
}: BottomNavProps) {
  return (
    <nav
      aria-label="Navigasi Utama"
      className={`w-full bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] z-30 select-none ${className}`}
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-[480px] mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const badgeCount = badges?.[item.id] ?? 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={`relative flex flex-col items-center justify-center h-full w-full py-1 text-center transition-colors group cursor-pointer focus:outline-none`}
            >
              {/* Active top line indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#4941EC] rounded-b-md transition-all shadow-[0_2px_6px_rgba(73,65,236,0.4)]" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative inline-flex items-center justify-center">
                <div
                  className={`transition-transform duration-200 group-active:scale-90 ${
                    isActive ? 'text-[#4941EC]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'stroke-[2.4] fill-[#4941EC]/15' : 'stroke-[1.8]'
                    }`}
                  />
                </div>

                {/* Red Notification Badge */}
                {badgeCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none z-10 animate-in fade-in zoom-in-75 duration-200"
                    aria-label={`${badgeCount} item di ${item.label}`}
                  >
                    {badgeCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 transition-colors ${
                  isActive
                    ? 'font-semibold text-[#4941EC]'
                    : 'font-normal text-gray-500 group-hover:text-gray-700'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
