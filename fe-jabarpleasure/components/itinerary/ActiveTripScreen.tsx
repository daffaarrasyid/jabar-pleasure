'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  MapPin,
  Navigation,
  CheckCircle2,
  Check,
  PartyPopper,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import RouteMapIllustration from '@/components/itinerary/RouteMapIllustration';
import { RouteWaypoint } from '@/components/itinerary/ItinerarySummaryScreen';

interface ActiveTripScreenProps {
  planTitle?: string;
  originName?: string;
  startTime?: string;
  waypoints?: RouteWaypoint[];
  onBack?: () => void;
  onFinishTrip?: () => void;
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
  },
  {
    id: 'botani-square',
    name: 'Botani Square (Botas)',
    address: 'Jl. Raya Pajajaran',
    role: 'Destinasi kedua',
    orderNumber: 2,
  },
];

export default function ActiveTripScreen({
  planTitle = 'Sehari di Bogor',
  originName = 'Stasiun Bogor',
  startTime = '11.30',
  waypoints = DEFAULT_WAYPOINTS,
  onBack,
  onFinishTrip,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRiwayat,
  wishlistCount = 3,
  className = '',
}: ActiveTripScreenProps) {
  // Current active destination index (0 = heading to Tugu Kujang, 1 = heading to Botas, 2 = all visited)
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

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

  const currentStop = waypoints[currentStopIndex] || waypoints[waypoints.length - 1];
  const isAllCompleted = currentStopIndex >= waypoints.length;

  const handleArriveAtStop = () => {
    if (currentStopIndex < waypoints.length) {
      setCurrentStopIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. App Header */}
      <AppHeader
        unreadNotifications={2}
        wishlistCount={wishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Scrollable Body Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-2 pb-28">
        {/* Header Row with Back Button */}
        <div className="flex items-start gap-2.5 mb-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Perjalanan aktif
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {planTitle} · Dimulai pukul {startTime}
            </p>
          </div>
        </div>

        {/* Status Badge & Visited Counter */}
        <div className="flex items-center justify-between mb-2">
          <span className="bg-[#D1FAE5] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-md">
            {isAllCompleted ? 'Selesai' : 'Sedang berlangsung'}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {Math.min(currentStopIndex, waypoints.length)} dari {waypoints.length} dikunjungi
          </span>
        </div>

        {/* Progress Bar (2 segments) */}
        <div className="grid grid-cols-2 gap-2 mb-3.5 select-none">
          <div
            className={`h-1 rounded-full transition-colors ${
              currentStopIndex >= 1 ? 'bg-[#4941EC]' : 'bg-[#4941EC]'
            }`}
          />
          <div
            className={`h-1 rounded-full transition-colors ${
              currentStopIndex >= 2 ? 'bg-[#4941EC]' : 'bg-[#E0E7FF]'
            }`}
          />
        </div>

        {/* Schematic Route Map Illustration */}
        <div className="mb-3.5">
          <RouteMapIllustration
            originName={originName}
            activeStopIndex={currentStopIndex}
          />
        </div>

        {/* Turn-by-Turn Live Guidance Card */}
        {!isAllCompleted ? (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-3.5 flex flex-col gap-2.5 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              {/* Purple Navigation Direction Square Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ArrowUp className="w-6 h-6 stroke-[2.8]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                  Menuju {currentStop.name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {currentStopIndex === 0
                    ? 'Ikuti arah ke Jl. Kapten Muslihat'
                    : 'Ikuti arah ke Jl. Raya Pajajaran'}
                </p>
              </div>
            </div>

            {/* Time, Distance, and Travel Mode */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-[#4941EC]">
                {currentStopIndex === 0 ? '±10 menit · 2,7 km' : '±4 menit · 400 m'}
              </span>
              <span className="text-xs font-semibold text-gray-600">
                Berkendara
              </span>
            </div>

            <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
              {currentStopIndex === 0
                ? `Dari ${originName} · Ikuti rambu lalu lintas setempat.`
                : `Dari ${waypoints[0]?.name || 'titik sebelumnya'} · Ikuti rambu lalu lintas setempat.`}
            </p>
          </div>
        ) : (
          /* Completion Banner */
          <div className="bg-[#ECFDF5] rounded-2xl p-4 border border-[#A7F3D0] mb-3.5 flex flex-col items-center text-center gap-2 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
              <PartyPopper className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              Perjalanan Selesai!
            </h2>
            <p className="text-xs text-gray-600 max-w-[280px]">
              Kamu telah mengunjungi semua destinasi dalam rencana {planTitle}. Semoga harimu menyenangkan!
            </p>
          </div>
        )}

        {/* Waypoints Tracking List Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-3.5 flex flex-col gap-3">
          {waypoints.map((stop, index) => {
            const isVisited = index < currentStopIndex;
            const isCurrent = index === currentStopIndex;

            return (
              <div
                key={stop.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Square Badge (Blue for stop 1, Green for stop 2, Checkmark if visited) */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isVisited
                        ? 'bg-[#10B981] text-white shadow-2xs'
                        : isCurrent
                        ? 'bg-[#4941EC] text-white shadow-2xs'
                        : 'bg-[#D1FAE5] text-[#059669]'
                    }`}
                  >
                    {isVisited ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      stop.orderNumber || index + 1
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {stop.name}
                    </h3>
                    <p
                      className={`text-[11px] mt-0.5 truncate ${
                        isVisited
                          ? 'text-[#10B981] font-semibold'
                          : isCurrent
                          ? 'text-[#4941EC] font-semibold'
                          : 'text-gray-500'
                      }`}
                    >
                      {isVisited
                        ? 'Sudah dikunjungi'
                        : isCurrent
                        ? `${stop.role} · Sedang dituju`
                        : `${stop.role} · 400 m dari Tugu Kujang`}
                    </p>
                  </div>
                </div>

                {/* Right Action: Paper airplane icon if current, Check icon if completed */}
                {isCurrent && (
                  <div className="p-1 text-[#4941EC] shrink-0 animate-pulse">
                    <Navigation className="w-4 h-4 fill-[#4941EC] stroke-[1.5]" />
                  </div>
                )}
                {isVisited && (
                  <div className="p-1 text-[#10B981] shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Breadcrumb footer */}
          <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
            Rute: {originName} → {waypoints.map((w) => w.name.split(' ')[0]).join(' → ')}
          </div>
        </div>

        {/* Action Button: Tiba di [Tujuan] or Selesaikan */}
        <div className="flex flex-col gap-1.5 mt-2">
          {!isAllCompleted ? (
            <>
              <button
                type="button"
                onClick={handleArriveAtStop}
                className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 stroke-[2.2]" />
                <span>Tiba di {currentStop.name}</span>
              </button>
              <p className="text-[11px] text-gray-500 text-center font-medium">
                {currentStopIndex === 0
                  ? 'Tandai tiba setelah sampai di tujuan pertama.'
                  : 'Tandai tiba setelah sampai di tujuan kedua.'}
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={onFinishTrip || onBack}
              className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#10B981]/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Selesai & Simpan ke Riwayat</span>
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
