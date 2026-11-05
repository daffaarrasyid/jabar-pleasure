'use client';

import React from 'react';
import {
  BarChart3,
  MapPin,
  Inbox,
  MessageSquare,
  Users,
  ShieldCheck,
  X,
  Compass,
} from 'lucide-react';

export type AdminMenuTab =
  | 'overview'
  | 'poi'
  | 'pengajuan'
  | 'saran'
  | 'akun'
  | 'moderasi';

interface AdminSidebarProps {
  activeTab?: AdminMenuTab;
  onSelectTab?: (tab: AdminMenuTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export default function AdminSidebar({
  activeTab = 'overview',
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  className = '',
}: AdminSidebarProps) {
  const menuItems = [
    {
      id: 'overview' as AdminMenuTab,
      label: 'Overview & Analitik',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'poi' as AdminMenuTab,
      label: 'Manajemen POI Destinasi',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'pengajuan' as AdminMenuTab,
      label: 'Pengajuan Lokasi',
      icon: Inbox,
      badge: '3',
      badgeColor: 'bg-[#EDAD40] text-white',
    },
    {
      id: 'saran' as AdminMenuTab,
      label: 'Saran & Masukan',
      icon: MessageSquare,
      badge: '5',
      badgeColor: 'bg-[#4941EC] text-white',
    },
  ];

  const secondaryItems = [
    {
      id: 'akun' as AdminMenuTab,
      label: 'Manajemen Akun',
      icon: Users,
    },
    {
      id: 'moderasi' as AdminMenuTab,
      label: 'Moderasi Media',
      icon: ShieldCheck,
    },
  ];

  const handleTabClick = (tabId: AdminMenuTab) => {
    onSelectTab?.(tabId);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-full lg:h-[calc(100vh-4rem)] w-64 sm:w-72 bg-white border-r border-gray-200/90 z-50 lg:z-10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${className}`}
      >
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto no-scrollbar">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Navigasi Admin
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Label (Matching Wireframe) */}
          <div className="mb-3 hidden lg:block">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Navigasi Admin
            </h2>
          </div>

          {/* Primary Menu Navigation */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4941EC] text-white shadow-[0_2px_10px_rgba(73,65,236,0.25)]'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive ? 'bg-white text-[#4941EC]' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-4 border-t border-gray-100" />

          {/* System Management Sub-items */}
          <div className="mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Pengaturan & Keamanan
            </h3>
          </div>

          <nav className="space-y-1.5">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4941EC] text-white shadow-[0_2px_10px_rgba(73,65,236,0.25)]'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex items-center gap-2 text-xs text-gray-500">
          <Compass className="w-4 h-4 text-[#4941EC] shrink-0" />
          <div className="truncate">
            <p className="font-semibold text-gray-800 text-[11px]">SRID 4326 PostGIS</p>
            <p className="text-[10px] text-gray-400">Jawa Barat WebGIS v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

