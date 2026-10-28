'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Navigation,
  MapPin,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';

interface DepartureLocationScreenProps {
  onBack?: () => void;
  onNext?: (location: { name: string; address: string; isGps: boolean }) => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToRiwayat?: () => void;
  wishlistCount?: number;
  initialGpsActive?: boolean;
  className?: string;
}

export default function DepartureLocationScreen({
  onBack,
  onNext,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRiwayat,
  wishlistCount = 0,
  initialGpsActive = false,
  className = '',
}: DepartureLocationScreenProps) {
  // State 1: GPS Active or Inactive (defaults to false per user request)
  const [isGpsActive, setIsGpsActive] = useState<boolean>(initialGpsActive);
  const [isActivatingGps, setIsActivatingGps] = useState<boolean>(false);

  // State 2: Search input text
  const [searchQuery, setSearchQuery] = useState<string>(
    initialGpsActive ? '' : 'Stasiun Bogor'
  );

  // State 3: Selected location
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    address: string;
  }>({
    name: 'Stasiun Bogor',
    address: 'Jl. Nyi Raja Permas, Bogor Tengah',
  });

  const handleActivateGps = () => {
    setIsActivatingGps(true);
    setTimeout(() => {
      setIsGpsActive(true);
      setIsActivatingGps(false);
      setSelectedLocation({
        name: 'Stasiun Bogor',
        address: 'Jl. Nyi Raja Permas, Bogor Tengah',
      });
      setSearchQuery('');
    }, 450);
  };

  const handleDeactivateGps = () => {
    setIsGpsActive(false);
    setSearchQuery('Stasiun Bogor');
  };

  const handleSelectManual = (loc: { name: string; address: string }) => {
    setSelectedLocation(loc);
    setSearchQuery(loc.name);
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onNavigateToProfile?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    } else if (tab === 'rencana') {
      onBack?.();
    }
  };

  const handleNextStep = () => {
    onNext?.({
      ...selectedLocation,
      isGps: isGpsActive,
    });
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. App Header with Brand Logo, Bell Badge & Wishlist Button */}
      <AppHeader
        unreadNotifications={2}
        wishlistCount={wishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-2 pb-28">
        {/* Top Header Row with Back Button */}
        <div className="flex items-start gap-2.5 mb-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali ke Rencana"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Titik keberangkatan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isGpsActive
                ? 'Dari mana petualanganmu dimulai?'
                : 'Pilih lokasi terkini atau masukkan sendiri'}
            </p>
          </div>

          {/* Quick toggle to test both states directly */}
          <button
            type="button"
            onClick={() => (isGpsActive ? handleDeactivateGps() : handleActivateGps())}
            className="text-[10px] text-gray-400 hover:text-[#4941EC] flex items-center gap-1 font-medium bg-white px-2 py-1 rounded-full border border-gray-200 shadow-2xs cursor-pointer shrink-0 mt-0.5"
            title="Klik untuk beralih mode GPS Aktif / Nonaktif"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>GPS: {isGpsActive ? 'Aktif' : 'Nonaktif'}</span>
          </button>
        </div>

        {/* Step Wizard Bar (3 steps: Keberangkatan, Destinasi, Ringkasan) */}
        <div className="flex flex-col gap-1.5 mb-4 select-none">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1 bg-[#4941EC] rounded-full transition-all" />
            <div className="h-1 bg-[#E0E7FF] rounded-full transition-all" />
            <div className="h-1 bg-[#E0E7FF] rounded-full transition-all" />
          </div>
          <div className="grid grid-cols-3 text-center">
            <span className="text-xs font-semibold text-[#4941EC]">
              Keberangkatan
            </span>
            <span className="text-xs font-medium text-gray-400">
              Destinasi
            </span>
            <span className="text-xs font-medium text-gray-400">
              Ringkasan
            </span>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative flex items-center bg-white rounded-xl border border-gray-200 px-3.5 py-2.5 shadow-2xs mb-3.5 focus-within:border-[#4941EC] focus-within:ring-2 focus-within:ring-[#4941EC]/15 transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari alamat atau nama tempat"
            className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* SCENARIO A: GPS NONAKTIF (Image 3) */}
        {/* ======================================================== */}
        {!isGpsActive && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* GPS Sedang Nonaktif Warning Card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    GPS sedang nonaktif
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lokasi terkini belum tersedia
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Aktifkan GPS hanya jika ingin menggunakan lokasi terkini. Kamu tetap bisa merencanakan perjalanan dengan lokasi manual.
              </p>

              {/* Aktifkan GPS Button */}
              <button
                type="button"
                onClick={handleActivateGps}
                disabled={isActivatingGps}
                className="w-full py-2.5 bg-white border border-[#4941EC] text-[#4941EC] hover:bg-[#4941EC]/5 active:scale-[0.99] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Navigation
                  className={`w-3.5 h-3.5 stroke-[2.4] ${isActivatingGps ? 'animate-spin' : ''}`}
                />
                <span>
                  {isActivatingGps ? 'Mendeteksi sinyal GPS...' : 'Aktifkan GPS'}
                </span>
              </button>
            </div>

            {/* Hasil Pencarian Lokasi Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2.5">
                Hasil pencarian lokasi
              </h3>

              {/* Selected Manual Location Card with Blue Border */}
              <div className="bg-white rounded-2xl p-3.5 border-2 border-[#4941EC] shadow-sm flex flex-col gap-2 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {selectedLocation.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedLocation.address}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#4941EC] fill-[#4941EC]/15 stroke-[2.2] shrink-0" />
                </div>

                <div className="pl-6.5">
                  <span className="bg-[#E6F8F0] text-[#10B981] text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block">
                    Lokasi manual terpilih
                  </span>
                </div>
              </div>
            </div>

            {/* Info Card: Bisa lanjut tanpa GPS */}
            <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70">
              <CheckCircle2 className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#4941EC]">
                  Bisa lanjut tanpa GPS
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Rekomendasi destinasi akan memakai {selectedLocation.name} sebagai titik keberangkatanmu.
                </p>
              </div>
            </div>

            {/* Confirmation Subtitle */}
            <p className="text-xs text-gray-500 text-center mt-2 font-medium">
              Lokasi manual: {selectedLocation.name}
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENARIO B: GPS AKTIF (Image 2) */}
        {/* ======================================================== */}
        {isGpsActive && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Gunakan Lokasi Terkini Card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
                    <Navigation className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Gunakan lokasi terkini
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      GPS aktif · Lokasi ditemukan
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#4941EC] fill-[#4941EC]/15 stroke-[2.2] shrink-0" />
              </div>

              {/* Subcard with selected location details */}
              <div className="bg-gray-50/80 rounded-xl p-3 flex items-center justify-between border border-gray-100">
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {selectedLocation.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {selectedLocation.address}
                  </p>
                </div>
                <span className="bg-[#E6F8F0] text-[#10B981] text-xs font-semibold px-2.5 py-1 rounded-md shrink-0">
                  Terpilih
                </span>
              </div>
            </div>

            {/* Stylized Mini Map Component matching Image 2 */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gray-100 bg-[#E8F1EC] p-3 shadow-inner flex flex-col justify-between select-none">
              {/* Organic green shape representing Kebun Raya Bogor */}
              <div className="absolute top-4 right-10 w-44 h-36 bg-[#D1E6D3] rounded-3xl opacity-80" />

              {/* Light blue curved river path */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 320 180"
                fill="none"
              >
                <path
                  d="M200 0 C220 50, 210 110, 240 180"
                  stroke="#CBE3E7"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              </svg>

              {/* Focus rectangle overlay like in the mockup */}
              <div className="absolute top-6 left-16 right-12 bottom-6 border-4 border-white/90 rounded-xl pointer-events-none shadow-xs" />

              {/* Labels on map */}
              <div className="relative z-10 flex justify-between items-start text-[11px] text-gray-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-gray-600">
                    Stasiun Bogor
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium pr-10 pt-8">
                  Kebun Raya Bogor
                </span>
              </div>

              {/* Blue Marker Dot for Stasiun Bogor */}
              <div className="absolute top-[72px] left-[60px] z-10 flex items-center justify-center">
                <span className="w-3.5 h-3.5 bg-[#4941EC] rounded-full border-2 border-white shadow-md animate-pulse" />
              </div>

              {/* Bottom Caption badge */}
              <div className="relative z-10 mt-auto">
                <span className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] text-gray-600 font-medium inline-block shadow-2xs border border-gray-100">
                  Lokasi terkini · Stasiun Bogor
                </span>
              </div>
            </div>

            {/* Section: Atau pilih lokasi manual */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Atau pilih lokasi manual
                </h3>
                <span className="text-xs text-gray-400 font-medium">Bogor</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-2xs overflow-hidden">
                {/* Option 1: Stasiun Bogor */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectManual({
                      name: 'Stasiun Bogor',
                      address: 'Jl. Nyi Raja Permas, Bogor Tengah',
                    })
                  }
                  className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E6F8F0] text-[#60CE9F] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                        Stasiun Bogor
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Jl. Nyi Raja Permas, Bogor Tengah
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#4941EC] stroke-[2.5]" />
                </button>

                {/* Option 2: Terminal Baranangsiang */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectManual({
                      name: 'Terminal Baranangsiang',
                      address: 'Jl. Raya Pajajaran, Bogor Timur',
                    })
                  }
                  className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E6F8F0] text-[#60CE9F] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                        Terminal Baranangsiang
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Jl. Raya Pajajaran, Bogor Timur
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#4941EC] stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Confirmation Subtitle */}
            <p className="text-xs text-gray-500 text-center mt-1 font-medium">
              Titik awal dipilih: {selectedLocation.name}
            </p>
          </div>
        )}

        {/* 3. Bottom CTA Button: Lanjut pilih destinasi */}
        <button
          type="button"
          onClick={handleNextStep}
          className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer mt-4"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          <span>Lanjut pilih destinasi</span>
        </button>
      </main>

      {/* 4. Fixed Bottom Navigation Bar with Rencana active */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-30">
        <BottomNav
          activeTab="rencana"
          onTabChange={handleTabChange}
          badges={{
            favorit: wishlistCount,
          }}
        />
      </div>
    </div>
  );
}
