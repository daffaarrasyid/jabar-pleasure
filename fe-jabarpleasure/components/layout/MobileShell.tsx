'use client';

import React from 'react';

interface MobileShellProps {
  children: React.ReactNode;
  activeScreen?: string;
  onScreenChange?: (screen: 'splash' | 'gateway' | 'login' | 'register' | 'register-success' | 'interest-selection' | 'home' | 'top-destinations' | 'map' | 'wishlist' | 'profile' | 'itinerary' | 'departure-location' | 'destination-selection' | 'itinerary-summary' | 'saved-plan' | 'active-trip' | 'trip-history' | 'trip-detail' | 'destination-doc' | 'trip-showcase') => void;
  className?: string;
}

export default function MobileShell({
  children,
  activeScreen,
  onScreenChange,
  className = '',
}: MobileShellProps) {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center sm:py-6 sm:px-4">
      {/* Dev / Preview Bar for quick switching between states (hidden on mobile, floating on desktop) */}
      {onScreenChange && (
        <aside
          aria-label="Screen View Controls"
          className="hidden md:flex items-center gap-1.5 mb-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-xs border border-gray-200 text-xs text-gray-600 select-none z-50 flex-wrap justify-center"
        >
          <span className="font-semibold text-gray-400 mr-1 text-[11px] uppercase tracking-wider">
            Preview Mode:
          </span>
          <button
            type="button"
            onClick={() => onScreenChange('splash')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'splash'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Splash Screen
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('gateway')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'gateway'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Sudah Punya Akun?
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('login')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'login'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Form Masuk
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('register')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'register'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Form Daftar
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('register-success')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'register-success'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Berhasil Daftar
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('interest-selection')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'interest-selection'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Pilih Minat
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('home')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'home'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('top-destinations')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'top-destinations'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Top Destinasi
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('map')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'map'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Peta (WebGIS)
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('wishlist')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'wishlist'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Wishlist
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('itinerary')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'itinerary'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Rencana
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('departure-location')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'departure-location'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Titik Keberangkatan
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('destination-selection')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'destination-selection'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Pilih Destinasi
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('itinerary-summary')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'itinerary-summary'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Ringkasan Rencana
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('saved-plan')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'saved-plan'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Rencana Tersimpan
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('active-trip')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'active-trip'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Perjalanan Aktif
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('trip-history')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'trip-history'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Riwayat Perjalanan
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('trip-detail')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'trip-detail'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Detail Perjalanan
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('destination-doc')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'destination-doc'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Dokumentasi Destinasi
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('trip-showcase')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'trip-showcase'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Lihat Perjalanan
          </button>
          <button
            type="button"
            onClick={() => onScreenChange('profile')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeScreen === 'profile'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Profil
          </button>
        </aside>
      )}

      {/* Mobile Canvas: Strict max-w-[480px] on desktop as mandated by DESIGN_SYSTEM.md */}
      <div
        className={`w-full max-w-[480px] min-h-dvh h-dvh sm:min-h-[844px] sm:h-[844px] bg-white sm:rounded-[32px] sm:shadow-xl sm:border sm:border-gray-200/90 relative flex flex-col overflow-hidden shrink-0 ${className}`}
      >
        <div className="w-full h-full flex-1 flex flex-col relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
