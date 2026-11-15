'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Users,
  FolderArchive,
  ChevronRight,
  ChevronLeft,
  X,
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
  // Default is collapsed (minimalist mode: logo & icons only) as requested
  const [isCollapsed, setIsCollapsed] = useState(true);

  const menuItems = [
    {
      id: 'overview' as AdminMenuTab,
      label: 'Overview & Analitik',
      icon: TrendingUp,
    },
    {
      id: 'poi' as AdminMenuTab,
      label: 'POI Destinasi',
      icon: MapPin,
    },
    {
      id: 'pengajuan' as AdminMenuTab,
      label: 'Pengajuan Lokasi',
      icon: CheckCircle2,
      badge: 3,
    },
    {
      id: 'saran' as AdminMenuTab,
      label: 'Saran & Masukan',
      icon: MessageSquare,
      badge: 5,
    },
    {
      id: 'akun' as AdminMenuTab,
      label: 'Manajemen Akun',
      icon: Users,
    },
    {
      id: 'moderasi' as AdminMenuTab,
      label: 'Moderasi Media',
      icon: FolderArchive,
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
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Floating Long Navbar-like Sidebar with Rounded Ends */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-4 left-0 h-screen lg:h-[calc(100vh-2rem)] lg:my-4 lg:ml-4 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] z-50 lg:z-20 flex flex-col justify-between p-3.5 sm:p-4 rounded-r-3xl lg:rounded-3xl select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
        } ${
          isOpenMobile ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${className}`}
      >
        {/* Floating Toggle Button di antara logo dengan menu pertama di ujung samping melayang */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-[66px] w-7 h-7 rounded-full bg-white border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hidden lg:flex items-center justify-center text-gray-500 hover:text-[#4941EC] hover:scale-120 active:scale-90 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer z-40 group/toggle"
          title={isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
          aria-label={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[2.4] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/toggle:scale-125" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[2.4] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/toggle:scale-125" />
          )}
        </button>

        <div className="relative">
          {/* Top Brand Logo Section */}
          <div className="relative pb-3 pt-1">
            <div
              className={`flex items-center ${
                isCollapsed ? 'lg:justify-center' : 'justify-between px-1.5'
              } transition-all duration-300`}
            >
              <div className="flex items-center gap-3 overflow-hidden group/logo cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt="JabarPleasure Logo"
                  className="w-8 h-9 object-contain shrink-0 drop-shadow-2xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/logo:scale-115"
                />
                <span
                  className={`text-base font-semibold text-gray-900 tracking-tight whitespace-nowrap transition-all duration-300 ${
                    isCollapsed
                      ? 'lg:opacity-0 lg:w-0 lg:hidden'
                      : 'opacity-100 w-auto'
                  }`}
                >
                  JabarPleasure
                </span>
              </div>

              {/* Mobile close button */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 lg:hidden cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Separator Line */}
            <div className="mt-3.5 h-px bg-gray-100/90 w-full" />
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleTabClick(item.id)}
                    className={`relative w-full flex items-center ${
                      isCollapsed
                        ? 'lg:justify-center px-0 py-2.5 rounded-2xl'
                        : 'gap-3 px-3.5 py-2.5 rounded-2xl'
                    } text-xs sm:text-sm font-semibold transition-all duration-200 ease-out cursor-pointer text-left active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#4941EC] text-white shadow-[0_2px_8px_rgba(73,65,236,0.18)]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="relative flex items-center justify-center shrink-0 w-6 h-6">
                      <Icon
                        className={`w-4.5 h-4.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-active:scale-90 ${
                          isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'
                        }`}
                      />
                      {item.badge && isCollapsed && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                      )}
                    </div>
                    <div
                      className={`flex items-center justify-between flex-1 min-w-0 transition-all duration-200 ${
                        isCollapsed
                          ? 'lg:opacity-0 lg:w-0 lg:hidden'
                          : 'opacity-100 w-auto'
                      }`}
                    >
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* iOS Floating Tooltip when Collapsed on Hover */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out hidden lg:flex items-center">
                      {/* Little Popover Caret */}
                      <div className="w-1.5 h-1.5 bg-gray-900/90 rotate-45 -mr-1 rounded-2xs" />
                      <div className="px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xl border border-white/10">
                        {item.label}
                        {item.badge ? ` (${item.badge})` : ''}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="pt-3 border-t border-gray-100/90 text-gray-400">
          {isCollapsed ? (
            <div className="hidden lg:flex items-center justify-center text-[10px] font-mono tracking-wider">
              <span>v2.4</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] px-1 font-medium">
              <span>JabarPleasure WebGIS</span>
              <span className="font-mono text-gray-400">v2.4</span>
            </div>
          )}
          {/* Mobile view footer */}
          <div className="lg:hidden flex items-center justify-between text-[11px] px-1 font-medium">
            <span>JabarPleasure WebGIS</span>
            <span className="font-mono text-gray-400">v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}
