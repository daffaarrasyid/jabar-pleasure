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
  onFinishTrip?: (visitedCount?: number) => void;
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
  {
    id: 'kebun-raya',
    name: 'Kebun Raya Bogor',
    address: 'Jl. Ir. H. Juanda No.13',
    role: 'Destinasi ketiga',
    orderNumber: 3,
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
  // Current active destination index (0 = heading to stop 1, 1 = heading to stop 2, etc.)
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [showEarlyFinishDialog, setShowEarlyFinishDialog] = useState(false);

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

  const handleConfirmEarlyFinish = () => {
    setShowEarlyFinishDialog(false);
    if (onFinishTrip) {
      onFinishTrip(currentStopIndex);
    } else {
      onBack?.();
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

        {/* Progress Bar (Dynamic Segments) */}
        <div
          className="grid gap-2 mb-3.5 select-none"
          style={{ gridTemplateColumns: `repeat(${waypoints.length}, minmax(0, 1fr))` }}
        >
          {waypoints.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-colors ${
                currentStopIndex > i
                  ? 'bg-[#10B981]'
                  : currentStopIndex === i
                  ? 'bg-[#4941EC]'
                  : 'bg-[#E0E7FF]'
              }`}
            />
          ))}
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
        <div className="flex flex-col gap-2 mt-2">
          {!isAllCompleted ? (
            <>
              {/* Primary action: Check-in / Tiba di tujuan aktif */}
              <button
                type="button"
                onClick={handleArriveAtStop}
                className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 stroke-[2.2]" />
                <span>Tiba di {currentStop.name} (Tujuan {currentStopIndex + 1})</span>
              </button>

              {/* Selesai Perjalanan (Selesai Lebih Awal) */}
              <button
                type="button"
                onClick={() => setShowEarlyFinishDialog(true)}
                className="w-full py-3 bg-white hover:bg-emerald-50/70 active:scale-[0.99] border border-emerald-300 text-[#059669] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#10B981] stroke-[2.4]" />
                <span>
                  Selesai Perjalanan
                  {currentStopIndex > 0
                    ? ` (${currentStopIndex}/${waypoints.length} tercapai)`
                    : ' Lebih Awal'}
                </span>
              </button>

              <p className="text-[11px] text-gray-500 text-center font-medium leading-relaxed">
                {currentStopIndex > 0
                  ? `${currentStopIndex} dari ${waypoints.length} destinasi telah dikunjungi. Klik "Selesai Perjalanan" jika ingin berhenti lebih awal.`
                  : 'Tandai tiba saat sampai di lokasi, atau selesaikan perjalanan lebih awal kapan saja jika ada kendala.'}
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => (onFinishTrip ? onFinishTrip(waypoints.length) : onBack?.())}
              className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#10B981]/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Selesai & Simpan ke Riwayat</span>
            </button>
          )}
        </div>
      </main>

      {/* Dialog Konfirmasi Selesaikan Perjalanan Lebih Awal */}
      {showEarlyFinishDialog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 max-w-[380px] w-full shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header Icon & Title */}
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Selesaikan Perjalanan Lebih Awal?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Simpan pencapaian kunjungan Anda ke Riwayat
                </p>
              </div>
            </div>

            {/* Content summary */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4 text-xs text-gray-600 space-y-1.5">
              <p className="font-semibold text-gray-800">
                Ringkasan Kunjungan:
              </p>
              <div className="flex items-center justify-between text-gray-700">
                <span>Destinasi dikunjungi:</span>
                <span className="font-bold text-[#10B981]">
                  {currentStopIndex} dari {waypoints.length} destinasi
                </span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                {currentStopIndex > 0 ? (
                  <>
                    Destinasi yang sudah Anda kunjungi ({waypoints.slice(0, currentStopIndex).map((w) => w.name).join(', ')}) akan tercatat rapi di <strong>Riwayat Perjalanan</strong>.
                  </>
                ) : (
                  <>
                    Belum ada destinasi yang Anda kunjungi. Perjalanan tetap akan diakhiri dan disimpan ke riwayat.
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmEarlyFinish}
                className="w-full py-3 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Ya, Selesaikan & Simpan Riwayat
              </button>
              <button
                type="button"
                onClick={() => setShowEarlyFinishDialog(false)}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Lanjutkan Perjalanan
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
