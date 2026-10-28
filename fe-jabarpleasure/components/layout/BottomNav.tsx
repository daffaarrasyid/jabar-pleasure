'use client';

import React from 'react';

export type NavTabId = 'beranda' | 'riwayat' | 'peta' | 'rencana' | 'profil' | 'favorit';

interface BottomNavProps {
  activeTab?: NavTabId;
  onTabChange?: (tab: NavTabId) => void;
  badges?: Partial<Record<NavTabId, number>>;
  className?: string;
}

// 1. Beranda Icon (Solid House)
function BerandaIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className={className}>
      <path d="M10.55 2.53C11.39 1.82 12.61 1.82 13.45 2.53L20.25 8.28C20.72 8.68 21 9.27 21 9.89V19C21 20.1 20.1 21 19 21H15C14.45 21 14 20.55 14 20V15C14 14.45 13.55 14 13 14H11C10.45 14 10 14.45 10 15V20C10 20.55 9.55 21 9 21H5C3.9 21 3 20.1 3 19V9.89C3 9.27 3.28 8.68 3.75 8.28L10.55 2.53Z" />
    </svg>
  );
}

// 2. Rencana Icon (Calendar with loops and header line matching mockup)
function RencanaIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3.5" y="5.5" width="17" height="15" rx="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M3.5 10.5H20.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7.5 2.5V6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16.5 2.5V6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// 3. Peta Icon (Featured inside prominent floating button: rotated lozenge with circle)
function PetaCompassIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5.5"
        y="5.5"
        width="21"
        height="21"
        rx="7"
        transform="rotate(-10 16 16)"
        stroke="white"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.6" fill="white" />
    </svg>
  );
}

// 4. Riwayat Icon (Bookmark with centered Heart cutout matching mockup)
function RiwayatIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 3C4.89543 3 4 3.89543 4 5V21.5C4 21.8482 4.3855 22.0573 4.67735 21.8674L12 17.1077L19.3227 21.8674C19.6145 22.0573 20 21.8482 20 21.5V5C20 3.89543 19.1046 3 18 3H6ZM12 8.35C11.3 7.2 9.6 7.2 8.85 8.1C8.2 8.9 8.35 10.1 9.2 10.9L12 13.5L14.8 10.9C15.65 10.1 15.8 8.9 15.15 8.1C14.4 7.2 12.7 7.2 12 8.35Z"
      />
    </svg>
  );
}

// 5. Profile Icon (User Silhouette)
function ProfileIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="7" r="4.2" />
      <path d="M4 19.5C4 16.2 7.5 14.5 12 14.5C16.5 14.5 20 16.2 20 19.5C20 20.3 19.3 21 18.5 21H5.5C4.7 21 4 20.3 4 19.5Z" />
    </svg>
  );
}

export default function BottomNav({
  activeTab = 'beranda',
  onTabChange,
  badges,
  className = '',
}: BottomNavProps) {
  return (
    <nav
      aria-label="Navigasi Utama"
      className={`relative w-full bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-30 select-none overflow-visible ${className}`}
    >
      <div className="relative grid grid-cols-5 items-end h-[68px] max-w-[480px] mx-auto px-1 pb-1.5 overflow-visible">
        {/* Item 1: Beranda */}
        <button
          type="button"
          onClick={() => onTabChange?.('beranda')}
          className="flex flex-col items-center justify-end h-full w-full py-1 text-center transition-colors group cursor-pointer focus:outline-none"
        >
          <div className="relative inline-flex items-center justify-center">
            <div
              className={`transition-transform duration-200 group-active:scale-90 ${
                activeTab === 'beranda' ? 'text-[#4941EC]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BerandaIcon />
            </div>
            {badges?.beranda && badges.beranda > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                {badges.beranda}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'beranda'
                ? 'font-semibold text-[#4941EC]'
                : 'font-normal text-gray-500 group-hover:text-gray-700'
            }`}
          >
            Beranda
          </span>
        </button>

        {/* Item 2: Rencana (Per explicit user rule) */}
        <button
          type="button"
          onClick={() => onTabChange?.('rencana')}
          className="flex flex-col items-center justify-end h-full w-full py-1 text-center transition-colors group cursor-pointer focus:outline-none"
        >
          <div className="relative inline-flex items-center justify-center">
            <div
              className={`transition-transform duration-200 group-active:scale-90 ${
                activeTab === 'rencana' ? 'text-[#4941EC]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <RencanaIcon />
            </div>
            {badges?.rencana && badges.rencana > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                {badges.rencana}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'rencana'
                ? 'font-semibold text-[#4941EC]'
                : 'font-normal text-gray-500 group-hover:text-gray-700'
            }`}
          >
            Rencana
          </span>
        </button>

        {/* Item 3: Peta (Ditonjolkan / Featured Raised Button in Center) */}
        <div className="relative flex flex-col items-center justify-end h-full w-full py-1 text-center">
          <button
            type="button"
            onClick={() => onTabChange?.('peta')}
            aria-label="Peta Eksplorasi"
            className={`-top-5 absolute flex items-center justify-center w-14 h-14 rounded-[22px] bg-[#4941EC] hover:bg-[#3D35D9] text-white shadow-lg shadow-[#4941EC]/35 hover:shadow-xl transition-all active:scale-95 cursor-pointer z-40 ${
              activeTab === 'peta' ? 'ring-4 ring-[#4941EC]/20 scale-105' : 'hover:scale-105'
            }`}
          >
            <PetaCompassIcon />
            {badges?.peta && badges.peta > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                {badges.peta}
              </span>
            )}
          </button>
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'peta'
                ? 'font-bold text-[#4941EC]'
                : 'font-semibold text-[#4941EC]'
            }`}
          >
            Peta
          </span>
        </div>

        {/* Item 4: Riwayat (Per explicit user rule) */}
        <button
          type="button"
          onClick={() => onTabChange?.('riwayat')}
          className="flex flex-col items-center justify-end h-full w-full py-1 text-center transition-colors group cursor-pointer focus:outline-none"
        >
          <div className="relative inline-flex items-center justify-center">
            <div
              className={`transition-transform duration-200 group-active:scale-90 ${
                activeTab === 'riwayat' ? 'text-[#4941EC]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <RiwayatIcon />
            </div>
            {badges?.riwayat && badges.riwayat > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                {badges.riwayat}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'riwayat'
                ? 'font-semibold text-[#4941EC]'
                : 'font-normal text-gray-500 group-hover:text-gray-700'
            }`}
          >
            Riwayat
          </span>
        </button>

        {/* Item 5: Profile */}
        <button
          type="button"
          onClick={() => onTabChange?.('profil')}
          className="flex flex-col items-center justify-end h-full w-full py-1 text-center transition-colors group cursor-pointer focus:outline-none"
        >
          <div className="relative inline-flex items-center justify-center">
            <div
              className={`transition-transform duration-200 group-active:scale-90 ${
                activeTab === 'profil' ? 'text-[#4941EC]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ProfileIcon />
            </div>
            {badges?.profil && badges.profil > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                {badges.profil}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'profil'
                ? 'font-semibold text-[#4941EC]'
                : 'font-normal text-gray-500 group-hover:text-gray-700'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
}

