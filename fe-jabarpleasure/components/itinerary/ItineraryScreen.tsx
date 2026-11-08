'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Calendar, Plus } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { getItineraries, ApiItinerary } from '@/lib/api';

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

interface ItineraryScreenProps {
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

const DEFAULT_ITINERARIES: SavedItinerary[] = [
  {
    id: 'itinerary-bogor-1',
    title: 'Sehari di Bogor',
    statusBadge: 'Tersimpan',
    statusText: 'Belum dimulai',
    origin: 'Dari Stasiun Bogor',
    destinationCount: 2,
    distance: '3,1 km',
    stops: ['Tugu Kujang', 'Botani Square (Botas)'],
    savedDate: 'Disimpan 27 Okt 2026',
    image: '/tugu-kujang.jpg',
  },
  {
    id: 'itinerary-bogor-2',
    title: 'Pagi di Kebun Raya',
    statusBadge: 'Tersimpan',
    statusText: 'Belum dimulai',
    origin: 'Dari Stasiun Bogor',
    destinationCount: 2,
    distance: '4,2 km',
    stops: ['Kebun Raya Bogor', 'Tugu Kujang'],
    savedDate: 'Disimpan 25 Okt 2026',
    image: '/kebun-raya-bogor.jpg',
  },
];

export default function ItineraryScreen({
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
    setIsLoading(true);
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
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-3 pb-28">
        {/* Page Title & Subtitle matching Image 1 */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Rencana Perjalanan
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Simpan ide trip, berangkat saat kamu siap
          </p>
        </div>

        {/* Section Header: Rencana tersimpan with badge */}
        <div className="flex items-center justify-between mb-3 select-none">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">
            Rencana tersimpan
          </h2>
          <span className="bg-[#E6F8F0] text-[#10B981] text-xs font-semibold px-2.5 py-0.5 rounded-lg">
            {isLoading ? '...' : `${itineraries.length} rencana`}
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

        {/* Empty State jika belum ada rencana tersimpan */}
        {!isLoading && itineraries.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center flex flex-col items-center gap-2.5 mb-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center">
              <MapPin className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mt-1">Belum Ada Rencana Tersimpan</h3>
            <p className="text-xs text-gray-500 max-w-[260px] leading-relaxed">
              Mulai rencanakan liburanmu! Pilih titik keberangkatan dan destinasi wisata favorit di Jawa Barat.
            </p>
          </div>
        )}

        {/* Saved Itinerary Cards List */}
        {!isLoading && itineraries.length > 0 && (
          <div className="flex flex-col gap-3.5 mb-4">
            {itineraries.map((plan) => (
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
                    <h3 className="text-base font-bold text-gray-900 truncate">
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
        <div className="bg-[#EEF2FF] rounded-2xl p-4 flex items-start gap-3 border border-[#E0E7FF]/70 mb-4">
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

        {/* CTA Button: + Buat rencana */}
        <button
          type="button"
          onClick={onCreatePlan}
          className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Buat rencana</span>
        </button>
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
