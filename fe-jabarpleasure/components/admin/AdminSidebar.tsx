'use client';

import React from 'react';
import {
  TrendingUp,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Users,
  FolderArchive,
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
    },
    {
      id: 'saran' as AdminMenuTab,
      label: 'Saran & Masukan',
      icon: MessageSquare,
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 z-50 lg:z-10 flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${className}`}
      >
        <div>
          {/* Top Brand Logo & Mobile Close */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="JabarPleasure Logo"
                className="w-8 h-9 object-contain"
              />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                JabarPleasure
              </span>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 lg:hidden cursor-pointer"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#4941EC] text-white shadow-[0_4px_14px_rgba(73,65,236,0.3)]'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400">
          <span>JabarPleasure WebGIS v2.4</span>
        </div>
      </aside>
    </>
  );
}
