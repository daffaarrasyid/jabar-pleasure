'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  ArrowUp,
  MapPin,
  Navigation,
  CheckCircle2,
  Check,
  PartyPopper,
  AlertTriangle,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { RouteWaypoint } from '@/components/itinerary/ItinerarySummaryScreen';
import { fetchRoadRoute } from '@/lib/routing';

const ItineraryRouteMap = dynamic(
  () => import('@/components/itinerary/ItineraryRouteMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 animate-pulse border border-gray-200">
        Memuat peta navigasi rute jalan...
      </div>
    ),
  }
);

interface ActiveTripScreenProps {
  planTitle?: string;
  originName?: string;
  originLat?: number;
  originLng?: number;
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
  {
    id: 'kebun-raya',
    name: 'Kebun Raya Bogor',
    address: 'Jl. Ir. H. Juanda No.13',
    role: 'Destinasi ketiga',
    orderNumber: 3,
    lat: -6.5976,
    lng: 106.7996,
  },
];

export default function ActiveTripScreen({
  planTitle = 'Sehari di Bogor',
  originName = 'Stasiun Bogor',
  originLat = -6.595,
  originLng = 106.7972,
  startTime,
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

  // Waktu mulai riil berbasis jam aktual jika tidak dispesifikasikan
  const [realStartTime] = useState<string>(() => {
    if (startTime && startTime !== '11.30') return startTime;
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')} WIB`;
  });

  // Jarak dan estimasi waktu riil untuk leg yang sedang dituju
  const [legDistanceKm, setLegDistanceKm] = useState<number>(2.7);
  const [legDurationMinutes, setLegDurationMinutes] = useState<number>(10);

  const currentStop = waypoints[currentStopIndex] || waypoints[waypoints.length - 1];
  const isAllCompleted = currentStopIndex >= waypoints.length;

  // Hitung rute dan durasi riil untuk segmen yang sedang aktif
  useEffect(() => {
    if (currentStopIndex >= waypoints.length || !currentStop) return;

    let isCancelled = false;

    const startCoords: [number, number] =
      currentStopIndex === 0
        ? [originLat, originLng]
        : [
            waypoints[currentStopIndex - 1]?.lat || -6.595,
            waypoints[currentStopIndex - 1]?.lng || 106.7972,
          ];

    const endCoords: [number, number] = [
      currentStop.lat || -6.6009,
      currentStop.lng || 106.8058,
    ];

    fetchRoadRoute([startCoords, endCoords])
      .then((res) => {
        if (isCancelled) return;
        if (res.distanceKm > 0) setLegDistanceKm(res.distanceKm);
        if (res.durationMinutes > 0) setLegDurationMinutes(res.durationMinutes);
      })
      .catch((err) => {
        console.warn('Failed to calculate leg ETA from road route:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [currentStopIndex, originLat, originLng, waypoints, currentStop]);

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
              {planTitle} · Dimulai pukul {realStartTime}
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

        {/* Real Leaflet WebGIS Map Component with Gray Visited Segments */}
        <div className="mb-3.5">
          <ItineraryRouteMap
            origin={{
              name: originName,
              lat: originLat,
              lng: originLng,
            }}
            waypoints={waypoints}
            activeStopIndex={currentStopIndex}
          />
        </div>

        {/* Turn-by-Turn Live Guidance Card */}
        {!isAllCompleted ? (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-3.5 flex flex-col gap-2.5 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ArrowUp className="w-6 h-6 stroke-[2.8]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                  Menuju {currentStop.name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {currentStop.address || `Menuju destinasi ke-${currentStopIndex + 1}`}
                </p>
              </div>
            </div>

            {/* Live Time, Distance, and Travel Mode from Real Road Route */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-[#4941EC]">
                ±{legDurationMinutes} menit · {legDistanceKm} km
              </span>
              <span className="text-xs font-semibold text-gray-600">
                Berkendara
              </span>
            </div>

            <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
              {currentStopIndex === 0
                ? `Dari ${originName} · Ikuti rute jalan raya setempat.`
                : `Dari ${waypoints[currentStopIndex - 1]?.name || 'titik sebelumnya'} · Ikuti rute jalan raya setempat.`}
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
              Kamu telah mengunjungi semua destinasi dalam rencana {planTitle}. Perjalanan ini siap disimpan ke riwayatmu!
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
                        ? 'Sudah dikunjungi (rute abu-abu)'
                        : isCurrent
                        ? `${stop.role} · Sedang dituju`
                        : `${stop.role}`}
                    </p>
                  </div>
                </div>

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
                  ? `${currentStopIndex} dari ${waypoints.length} destinasi telah dikunjungi. Klik "Selesai Perjalanan" jika ingin menyimpan riwayat.`
                  : 'Tandai tiba saat sampai di lokasi, atau selesaikan perjalanan kapan saja untuk menyimpannya ke Riwayat.'}
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

      {/* Confirmation Dialog: Selesai Lebih Awal */}
      {showEarlyFinishDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl flex flex-col gap-3 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-gray-900">
                Selesaikan Perjalanan Sekarang?
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {currentStopIndex > 0
                  ? `Kamu telah mengunjungi ${currentStopIndex} dari ${waypoints.length} destinasi. Trip ini akan ditutup dan disimpan ke Riwayat.`
                  : `Kamu belum tiba di destinasi mana pun. Tetap selesaikan perjalanan dan simpan ke Riwayat?`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowEarlyFinishDialog(false)}
                className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Lanjut Jalan
              </button>
              <button
                type="button"
                onClick={handleConfirmEarlyFinish}
                className="py-2 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Ya, Selesai
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
