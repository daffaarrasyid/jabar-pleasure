'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Plus } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { getItineraries, ApiItinerary } from '@/lib/api';

function EmptyItineraryVector() {
  return (
    <svg
      width="130"
      height="110"
      viewBox="0 0 130 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xs"
    >
      <defs>
        <linearGradient id="mapGrad" x1="15" y1="15" x2="115" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EEF2FF" />
          <stop stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="pinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6366F1" />
          <stop stopColor="#4941EC" />
        </linearGradient>
      </defs>
      {/* Folded Map Background */}
      <path
        d="M18 24L48 16L82 24L112 16V86L82 94L48 86L18 94V24Z"
        fill="url(#mapGrad)"
        stroke="#CBD5E1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Map fold lines */}
      <path d="M48 16V86" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M82 24V94" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
      
      {/* Winding Route Path */}
      <path
        d="M32 68C38 52 56 60 64 44C72 28 88 40 96 32"
        stroke="#4941EC"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      {/* Start Dot */}
      <circle cx="32" cy="68" r="4.5" fill="#10B981" stroke="white" strokeWidth="1.5" />
      
      {/* Mid Waypoint */}
      <circle cx="64" cy="44" r="3.5" fill="#60CE9F" stroke="white" strokeWidth="1.5" />

      {/* Destination Pin */}
      <g transform="translate(86, 12)">
        <path
          d="M10 0C4.477 0 0 4.477 0 10C0 17 10 26 10 26C10 26 20 17 20 10C20 4.477 15.523 0 10 0Z"
          fill="url(#pinGrad)"
        />
        <circle cx="10" cy="9.5" r="3.5" fill="white" />
      </g>
      {/* Sparkles */}
      <circle cx="108" cy="42" r="2" fill="#F59E0B" />
      <circle cx="22" cy="14" r="1.5" fill="#60CE9F" />
    </svg>
  );
}

export interface SavedItinerary {
  id: string;
  title: string;
  statusBadge: string;
  statusText: string;
  origin: string;
  destinationCount: number;
  distance: string;
  stops: string[];
  savedDate: string;
  image: string;
  rawItinerary?: ApiItinerary;
}

export interface ActiveTripData {
  itineraryId?: string | number;
  title: string;
  originName: string;
  originLat: number;
  originLng: number;
  startTime?: string;
  waypoints: {
    id: string;
    name: string;
    address: string;
    role: string;
    orderNumber?: number;
    lat?: number;
    lng?: number;
  }[];
  currentStopIndex: number;
  distance?: string;
  status?: 'in_progress' | 'completed';
}

interface ItineraryScreenProps {
  activeTrip?: ActiveTripData | null;
  onResumeActiveTrip?: () => void;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToRiwayat?: () => void;
  onCreatePlan?: () => void;
  onViewPlan?: (plan: SavedItinerary) => void;
  wishlistCount?: number;
  activeTab?: NavTabId;
  className?: string;
}

export default function ItineraryScreen({
  activeTrip,
  onResumeActiveTrip,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRiwayat,
  onCreatePlan,
  onViewPlan,
  wishlistCount = 0,
  activeTab = 'rencana',
  className = '',
}: ItineraryScreenProps) {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    getItineraries('planned')
      .then((data) => {
        if (isCancelled) return;
        const activeData = (data || []).filter((item) => item.status !== 'completed');
        if (activeData && activeData.length > 0) {
          const formatted: SavedItinerary[] = activeData.map((item) => {
            const stops = item.items?.map((it) => it.destination?.name || 'Destinasi').filter(Boolean) || [];
            const originName =
              item.route_geojson?.properties?.departure_name ||
              item.route_geojson?.departure_name ||
              'Titik Keberangkatan';
            const distance = item.route_geojson?.properties?.distance_km
              ? `${item.route_geojson.properties.distance_km} km`
              : '±3,1 km';
            const firstImage =
              item.items?.[0]?.destination?.cover_image_url ||
              item.items?.[0]?.destination?.cover_image ||
              '/tugu-kujang.jpg';

            const createdDate = item.created_at
              ? new Date(item.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Baru saja';

            return {
              id: String(item.id),
              title: item.title,
              statusBadge: 'Tersimpan',
              statusText: 'Belum dimulai',
              origin: `Dari ${originName}`,
              destinationCount: item.items?.length || stops.length || 1,
              distance,
              stops: stops.length > 0 ? stops : ['Destinasi Wisata'],
              savedDate: `Disimpan ${createdDate}`,
              image: firstImage,
              rawItinerary: item,
            };
          });
          setItineraries(formatted);
        } else {
          setItineraries([]);
        }
      })
      .catch((err) => {
        console.warn('Could not load saved itineraries:', err);
        if (!isCancelled) setItineraries([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onNavigateToProfile?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    }
  };

  const displaySavedItineraries = itineraries.filter((plan) => {
    if (activeTrip && activeTrip.status !== 'completed') {
      if (activeTrip.itineraryId && String(plan.id) === String(activeTrip.itineraryId)) return false;
      if (activeTrip.title && plan.title === activeTrip.title) return false;
    }
    return true;
  });

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. App Header with Brand Logo, Bell Badge & Wishlist Button */}
      <AppHeader
        wishlistCount={wishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-3 pb-28">
        {/* Page Title & Subtitle with Create Plan Button beside title */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              Rencana Perjalanan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Simpan ide trip, berangkat saat kamu siap
            </p>
          </div>
          {onCreatePlan && (
            <button
              type="button"
              onClick={onCreatePlan}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0"
              title="Buat rencana baru"
              aria-label="Buat rencana baru"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Section: Sedang Berjalan (Hanya muncul saat ada perjalanan yang sedang aktif) */}
        {activeTrip && activeTrip.status !== 'completed' && (
          <div className="mb-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2.5 select-none">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
                </span>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Sedang Berjalan
                </h2>
              </div>
              <span className="bg-[#D1FAE5] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                Aktif
              </span>
            </div>

            {/* Active Trip Card */}
            <div className="bg-white rounded-2xl p-4 border border-[#A7F3D0] shadow-[0_2px_12px_rgba(16,185,129,0.08)] flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {activeTrip.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Dimulai dari {activeTrip.originName} · {activeTrip.startTime || 'Hari ini'}
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-[#E6F8F0] text-[#10B981] text-xs font-bold shrink-0">
                  {Math.min(activeTrip.currentStopIndex, activeTrip.waypoints.length)} / {activeTrip.waypoints.length} tercapai
                </div>
              </div>

              {/* Waypoint indicators & Action */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium truncate flex-1 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span className="truncate">
                    {activeTrip.currentStopIndex < activeTrip.waypoints.length
                      ? `Menuju: ${activeTrip.waypoints[activeTrip.currentStopIndex]?.name}`
                      : 'Semua destinasi telah tercapai'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onResumeActiveTrip}
                  className="bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Lanjutkan Perjalanan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Header: Rencana tersimpan with badge */}
        <div className="flex items-center justify-between mb-3 select-none">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900">
            Rencana tersimpan
          </h2>
          <span className="bg-[#E6F8F0] text-[#10B981] text-xs font-semibold px-2.5 py-0.5 rounded-lg">
            {isLoading ? '...' : `${displaySavedItineraries.length} rencana`}
          </span>
        </div>

        {/* Skeleton Screen saat memuat data */}
        {isLoading && (
          <div className="flex flex-col gap-3.5 mb-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col gap-3 animate-pulse"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-50 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded-xl w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State jika belum ada rencana tersimpan (No fill container, 2D vector) */}
        {!isLoading && displaySavedItineraries.length === 0 && (
          <div className="py-8 sm:py-12 flex flex-col items-center text-center gap-2.5 mb-4 animate-in fade-in duration-300 select-none">
            <EmptyItineraryVector />
            <h3 className="text-base font-semibold text-gray-900 mt-2">Belum Ada Rencana Tersimpan</h3>
            <p className="text-xs text-gray-500 max-w-[280px] leading-relaxed">
              Mulai rencanakan liburanmu! Pilih titik keberangkatan dan destinasi wisata favorit di Jawa Barat.
            </p>
          </div>
        )}

        {/* Saved Itinerary Cards List */}
        {!isLoading && displaySavedItineraries.length > 0 && (
          <div className="flex flex-col gap-3.5 mb-4">
            {displaySavedItineraries.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col gap-3"
              >
                {/* Card Top: Thumbnail & Info */}
                <div className="flex items-start gap-3.5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={plan.image}
                      alt={plan.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {plan.title}
                    </h3>
                    <div className="mt-1">
                      <span className="bg-[#E6F8F0] text-[#10B981] text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block">
                        {plan.statusBadge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 font-medium">
                      {plan.statusText}
                    </p>
                  </div>
                </div>

                {/* Card Middle: Distance & Route stops */}
                <div className="pt-2 border-t border-gray-50 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#60CE9F] stroke-[2.2] shrink-0" />
                    <span>
                      {plan.origin} · {plan.destinationCount} destinasi · {plan.distance}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 pl-5">
                    {plan.stops.join(' → ')}
                  </p>
                </div>

                {/* Card Bottom: Saved Date & Action Button */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {plan.savedDate}
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewPlan?.(plan)}
                    className="bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Lihat rencana
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Callout Card: Belum ada perjalanan dimulai */}
        <div className="bg-[#EEF2FF] rounded-2xl p-4 flex items-start gap-3 border border-[#E0E7FF]/70 mb-2">
          <Calendar className="w-5 h-5 text-[#4941EC] stroke-[2] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-[#4941EC]">
              Belum ada perjalanan dimulai
            </h4>
            <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
              Trip yang sudah selesai ada di tab Riwayat. Rencana di sini tetap tersimpan sampai kamu mulai.
            </p>
          </div>
        </div>
      </main>

      {/* 3. Fixed Bottom Navigation Bar with Rencana active */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-30">
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          badges={{
            favorit: wishlistCount,
          }}
        />
      </div>
    </div>
  );
}
