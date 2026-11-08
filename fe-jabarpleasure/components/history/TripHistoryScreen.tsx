'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Compass, Navigation } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TripItem } from '@/components/history/historyData';

interface TripHistoryScreenProps {
  trips?: TripItem[];
  isLoading?: boolean;
  onSelectTrip?: (trip: TripItem) => void;
  onViewShowcase?: (trip: TripItem) => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToRencana?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  wishlistCount?: number;
  className?: string;
}

/**
 * Format location string to ensure no "Lokasi GPS Anda" remains,
 * and directly output a clean place name like "Bogor, Jawa Barat".
 */
function formatDisplayLocation(loc: string): string {
  if (!loc) return 'Bogor, Jawa Barat';
  let cleaned = loc
    .replace(/lokasi gps anda/gi, '')
    .replace(/titik keberangkatan/gi, '')
    .trim();
  cleaned = cleaned.replace(/^[,\s-]+|[,\s-]+$/g, '');
  if (!cleaned) return 'Bogor, Jawa Barat';
  if (!cleaned.toLowerCase().includes('jawa barat')) {
    cleaned += ', Jawa Barat';
  }
  return cleaned;
}

/**
 * Format completed date to ensure day name and date are clearly written
 * (e.g. "Minggu, 8 Nov 2026").
 */
function formatCompletedDayDate(dateStr: string): string {
  if (!dateStr) {
    const now = new Date();
    return now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  if (days.some((d) => dateStr.includes(d))) {
    return dateStr;
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return dateStr;
}

export default function TripHistoryScreen({
  trips = [],
  isLoading = false,
  onSelectTrip,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToRencana,
  onNavigateToMap,
  onNavigateToProfile,
  wishlistCount = 4,
  className = '',
}: TripHistoryScreenProps) {
  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'rencana') {
      onNavigateToRencana?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onNavigateToProfile?.();
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
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-3 pb-28">
        {/* Title & Counter */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Riwayat Perjalanan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Lihat kembali trip yang sudah selesai
            </p>
          </div>

          {/* Circle Counter */}
          <div className="w-7 h-7 rounded-full border border-[#4941EC] text-[#4941EC] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            {isLoading ? (
              <span className="w-3 h-3 border-2 border-[#4941EC] border-t-transparent rounded-full animate-spin" />
            ) : (
              trips.length
            )}
          </div>
        </div>

        {/* State 1: Skeleton Screen while loading from database */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3 animate-pulse"
              >
                {/* Header Row Skeleton */}
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2 py-0.5">
                    <div className="flex gap-1.5">
                      <div className="h-4 w-28 bg-gray-200 rounded-md" />
                      <div className="h-4 w-14 bg-gray-200 rounded-md" />
                    </div>
                    <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
                    <div className="h-3.5 w-1/2 bg-gray-200 rounded-md" />
                  </div>
                </div>

                {/* 3 Stats Columns Row Skeleton */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 bg-gray-100 rounded-xl" />
                  <div className="h-12 bg-gray-100 rounded-xl" />
                  <div className="h-12 bg-gray-100 rounded-xl" />
                </div>

                {/* Destination Initials Skeleton */}
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                </div>

                {/* Footer Row Skeleton */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="h-3.5 w-32 bg-gray-200 rounded-md" />
                  <div className="h-8 w-28 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* State 2: Empty State - Pemberitahuan untuk mulai lakukan perjalanan */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-center flex flex-col items-center gap-3 my-auto mt-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center mb-1 shadow-xs">
              <Compass className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Belum Ada Riwayat Perjalanan
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 max-w-[280px] mx-auto leading-relaxed">
                Rencana perjalanan yang telah kamu selesaikan akan otomatis tersimpan di sini. Yuk, mulai buat rencana dan lakukan perjalanan pertamamu!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToRencana?.()}
              className="mt-2 w-full max-w-[260px] py-3.5 px-4 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 stroke-[2.2]" />
              <span>Mulai Lakukan Perjalanan</span>
            </button>
          </div>
        ) : (
          /* State 3: Real Trips List */
          <div className="flex flex-col gap-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTrip?.(trip)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Header Info */}
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={trip.image || '/tugu-kujang.jpg'}
                      alt={trip.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="bg-[#EEF0FF] text-[#4941EC] text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[150px]">
                        {trip.category || 'Wisata Alam & Terbuka'}
                      </span>
                      <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0">
                        {trip.status}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 truncate mb-1">
                      {trip.title}
                    </h2>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mb-1 truncate">
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>{trip.duration}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span className="truncate">{formatDisplayLocation(trip.location)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats 3-Column Boxes */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 text-left border border-gray-100/80">
                    <span className="text-[10px] text-gray-500 font-medium block">
                      Destinasi
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {trip.stats.destinations}
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 text-left border border-gray-100/80">
                    <span className="text-[10px] text-gray-500 font-medium block">
                      Foto
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {trip.stats.photos}
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 text-left border border-gray-100/80">
                    <span className="text-[10px] text-gray-500 font-medium block">
                      Video
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {trip.stats.video}
                    </span>
                  </div>
                </div>

                {/* Destination Initials Circles */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(trip.initials || ['JP']).map((init, idx) => (
                    <div
                      key={idx}
                      className="w-7 h-7 rounded-full bg-[#F1F5F9] text-gray-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-gray-200"
                    >
                      {init}
                    </div>
                  ))}
                </div>

                {/* Footer Row */}
                <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">
                    Selesai {formatCompletedDayDate(trip.completedDate)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrip?.(trip);
                    }}
                    className="px-4 py-2 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Lihat Perjalanan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 3. Bottom Navigation Bar with Riwayat Active (4th tab) */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-30">
        <BottomNav
          activeTab="riwayat"
          onTabChange={handleTabChange}
          badges={{
            favorit: wishlistCount,
          }}
        />
      </div>
    </div>
  );
}
