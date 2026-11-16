'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  Check,
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
  wishlistCount = 0,
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
  const [showStartModal, setShowStartModal] = useState<boolean>(false);

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
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
            Rencana tersimpan
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Petualanganmu bisa dimulai kapan saja
          </p>
        </div>

        {/* Success Hero Section with 2D Vector Animation & Soft Typography */}
        <div className="flex flex-col items-center text-center my-3 animate-in fade-in duration-300 select-none">
          {/* Animated 2D Vector Success Seal */}
          <div className="relative w-24 h-24 flex items-center justify-center mb-3">
            {/* Outer Circular Pulse Glow */}
            <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping opacity-30 pointer-events-none" style={{ animationDuration: '3s' }} />

            {/* 2D Vector SVG Illustration with Circular Ring and Checkmark Pop */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-sm"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="mapCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EEF2FF" />
                  <stop offset="100%" stopColor="#E0E7FF" />
                </linearGradient>
              </defs>

              {/* Background circular halo */}
              <circle cx="50" cy="50" r="44" fill="#ECFDF5" />

              {/* Animated Progress Circle Stroke */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#circleGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset="0"
                className="transition-all duration-1000 ease-out"
              />

              {/* 2D Vector Folded Travel Document / Itinerary Card */}
              <g className="animate-in zoom-in-75 duration-500 ease-out origin-center">
                {/* Document Base */}
                <rect
                  x="28"
                  y="24"
                  width="44"
                  height="52"
                  rx="10"
                  fill="url(#mapCardGrad)"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                />
                {/* Header ribbon on card */}
                <path
                  d="M28 34C28 28.4772 32.4772 24 38 24H62C67.5228 24 72 28.4772 72 34V36H28V34Z"
                  fill="#4941EC"
                />
                {/* Route pin lines inside document */}
                <circle cx="38" cy="46" r="2.5" fill="#10B981" />
                <path d="M41 46H62" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="38" cy="56" r="2.5" fill="#4941EC" />
                <path d="M41 56H56" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="38" cy="66" r="2.5" fill="#F59E0B" />
                <path d="M41 66H50" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

                {/* Overlaid Green Success Badge with Checkmark */}
                <circle cx="68" cy="68" r="14" fill="#10B981" stroke="white" strokeWidth="3" className="drop-shadow-md" />
                <path
                  d="M62 68L66 72L74 64"
                  stroke="white"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Sparkling vector stars */}
              <path d="M82 22L83 25L86 26L83 27L82 30L81 27L78 26L81 25Z" fill="#F59E0B" />
              <circle cx="18" cy="42" r="2" fill="#34D399" />
              <circle cx="22" cy="74" r="1.5" fill="#60CE9F" />
            </svg>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
            Yeay, rencanamu aman!
          </h2>

          <p className="text-xs text-gray-600 mt-1 max-w-[280px] leading-relaxed font-normal">
            {planTitle} sudah disimpan ke daftar rencanamu. <br />
            Perjalanan belum dimulai.
          </p>

          {/* Status Badges */}
          <div className="flex items-center gap-2 mt-2.5">
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

        {/* Action Buttons: Primary is "Lakukan Perjalanan", Secondary is "Kembali ke Rencana" */}
        <div className="flex flex-col gap-2.5">
          {/* Primary Button: Lakukan Perjalanan */}
          {onStartTrip && (
            <button
              type="button"
              onClick={() => setShowStartModal(true)}
              className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
            >
              <span>Lakukan perjalanan</span>
            </button>
          )}

          {/* Secondary Button: Kembali ke Rencana */}
          <button
            type="button"
            onClick={onBackToRencana}
            className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
          >
            <span>Kembali ke Rencana</span>
          </button>
        </div>
      </main>

      {/* Confirmation Modal: Mulai Lakukan Perjalanan */}
      {showStartModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl flex flex-col gap-3 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900">
                Mulai Perjalanan Sekarang?
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Apakah kamu yakin ingin memulai perjalanan &ldquo;{planTitle}&rdquo; sekarang? Status perjalanan akan aktif dan dapat dipantau langsung.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowStartModal(false);
                  onStartTrip?.();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Ya, Mulai
              </button>
            </div>
          </div>
        </div>
      )}

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
