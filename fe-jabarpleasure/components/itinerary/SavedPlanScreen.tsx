'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  BookmarkCheck,
  Navigation,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { RouteWaypoint } from '@/components/itinerary/ItinerarySummaryScreen';

const ItineraryRouteMap = dynamic(
  () => import('@/components/itinerary/ItineraryRouteMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 animate-pulse border border-gray-200">
        Memuat peta rute tersimpan...
      </div>
    ),
  }
);

interface SavedPlanScreenProps {
  planTitle?: string;
  originName?: string;
  originAddress?: string;
  originLat?: number;
  originLng?: number;
  waypoints?: RouteWaypoint[];
  totalDistanceKm?: number;
  savedTimestamp?: string;
  onStartTrip?: () => void;
  onBackToRencana?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToRiwayat?: () => void;
  wishlistCount?: number;
  className?: string;
}

const DEFAULT_WAYPOINTS: RouteWaypoint[] = [
  {
    id: 'tugu-kujang',
    name: 'Tugu Kujang',
    address: 'Jl. Raya Pajajaran',
    role: 'Destinasi pertama',
    orderNumber: 1,
    lat: -6.6009,
    lng: 106.8058,
  },
  {
    id: 'botani-square',
    name: 'Botani Square (Botas)',
    address: 'Jl. Raya Pajajaran',
    role: 'Destinasi kedua',
    orderNumber: 2,
    lat: -6.6022,
    lng: 106.8065,
  },
];

export default function SavedPlanScreen({
  planTitle = 'Sehari di Bogor',
  originName = 'Stasiun Bogor',
  originAddress = 'Kota Bogor',
  originLat = -6.595,
  originLng = 106.7972,
  waypoints = DEFAULT_WAYPOINTS,
  totalDistanceKm,
  savedTimestamp,
  onStartTrip,
  onBackToRencana,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRiwayat,
  wishlistCount = 3,
  className = '',
}: SavedPlanScreenProps) {
  const [calculatedKm, setCalculatedKm] = useState<number>(totalDistanceKm || 3.1);

  // Generate real default timestamp jika tidak disediakan
  const [realTimestamp] = useState<string>(() => {
    if (savedTimestamp && !savedTimestamp.includes('27 Okt 2026')) {
      return savedTimestamp;
    }
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = `${now.getHours().toString().padStart(2, '0')}.${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    return `Disimpan ${dateStr} · ${timeStr} WIB`;
  });

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
      onBackToRencana?.();
    }
  };

  const safeWaypoints = waypoints && waypoints.length > 0 ? waypoints : DEFAULT_WAYPOINTS;

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. App Header */}
      <AppHeader
        wishlistCount={wishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Scrollable Body Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-2 pb-28">
        {/* Title Header */}
        <div className="mb-4">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Rencana tersimpan
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Petualanganmu bisa dimulai kapan saja
          </p>
        </div>

        {/* Success Hero Section */}
        <div className="flex flex-col items-center text-center my-3 animate-in fade-in duration-300">
          {/* Big Mint Circle with Bookmark Check Icon */}
          <div className="w-20 h-20 rounded-full bg-[#D1FAE5] flex items-center justify-center mb-3.5 shadow-xs">
            <BookmarkCheck className="w-10 h-10 text-[#4941EC] stroke-[2.2]" />
          </div>

          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
            Yeay, rencanamu aman!
          </h2>

          <p className="text-xs text-gray-600 mt-1 max-w-[280px] leading-relaxed">
            {planTitle} sudah disimpan ke daftar rencanamu. <br />
            Perjalanan belum dimulai.
          </p>

          {/* Status Badges */}
          <div className="flex items-center gap-2 mt-3">
            <span className="bg-[#D1FAE5] text-[#059669] text-xs font-semibold px-3 py-1 rounded-md">
              Tersimpan
            </span>
            <span className="bg-[#D1FAE5] text-[#059669] text-xs font-semibold px-3 py-1 rounded-md">
              Belum dimulai
            </span>
          </div>
        </div>

        {/* Plan Header Info with Real Distance and Destinations Count */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <h3 className="text-sm font-bold text-gray-900 truncate pr-2">
            {planTitle}
          </h3>
          <span className="text-xs text-gray-500 font-medium shrink-0">
            {safeWaypoints.length} destinasi · ±{calculatedKm} km
          </span>
        </div>

        {/* Real Leaflet WebGIS Map of the Saved Itinerary */}
        <div className="mb-4">
          <ItineraryRouteMap
            origin={{
              name: originName,
              lat: originLat,
              lng: originLng,
            }}
            waypoints={safeWaypoints}
            onRouteCalculated={(dist) => {
              if (dist > 0) setCalculatedKm(dist);
            }}
          />
        </div>

        {/* Rute Perjalanan Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-3.5">
          <h4 className="text-xs font-bold text-gray-900 mb-3">
            Rute perjalanan
          </h4>

          {/* Connected Waypoints Timeline */}
          <div className="relative flex flex-col gap-3.5">
            {/* Vertical connector line */}
            <div className="absolute left-3.5 top-5 bottom-4 w-0.5 bg-gray-200 -z-0" />

            {/* Titik Keberangkatan Riil */}
            <div className="relative flex items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#E6F8F0] border border-[#60CE9F] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {originName}
                  </h5>
                  <p className="text-[11px] text-gray-500 truncate">
                    Titik keberangkatan · {originAddress || 'Jawa Barat'}
                  </p>
                </div>
              </div>
            </div>

            {/* Waypoints Riil */}
            {safeWaypoints.map((stop, index) => {
              const isFirstStop = index === 0;

              return (
                <div
                  key={stop.id || index}
                  className="relative flex items-center justify-between gap-3 z-10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isFirstStop
                          ? 'bg-[#4941EC] text-white shadow-xs'
                          : 'bg-[#EEF2FF] text-[#4941EC] border border-[#E0E7FF]'
                      }`}
                    >
                      {stop.orderNumber || index + 1}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {stop.name}
                      </h5>
                      <p className="text-[11px] text-gray-500 truncate">
                        {stop.address} · {stop.role || `Destinasi ke-${index + 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box: Tidak otomatis memulai perjalanan */}
        <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70 mb-4">
          <Calendar className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-xs font-bold text-[#4941EC]">
              Tidak otomatis memulai perjalanan
            </h5>
            <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
              Buka rencana ini dari tab Rencana, lalu pilih &ldquo;Lakukan perjalanan&rdquo; saat kamu siap berangkat.
            </p>
          </div>
        </div>

        {/* Timestamp Riil */}
        <p className="text-[11px] text-gray-400 text-center font-medium mb-3">
          {realTimestamp}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Button: Kembali ke Rencana */}
          <button
            type="button"
            onClick={onBackToRencana}
            className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Kembali ke Rencana</span>
          </button>

          {/* Button: Lakukan Perjalanan Sekarang (opsional jika siap langsung berangkat) */}
          {onStartTrip && (
            <button
              type="button"
              onClick={onStartTrip}
              className="w-full py-3 bg-white hover:bg-gray-50 border-2 border-[#4941EC] text-[#4941EC] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Navigation className="w-4 h-4 fill-[#4941EC] stroke-[1.5]" />
              <span>Lakukan perjalanan sekarang</span>
            </button>
          )}
        </div>
      </main>

      {/* 3. Bottom Navigation Bar */}
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
