'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TripItem } from '@/components/history/historyData';
import FeedbackModal from '@/components/feedback/FeedbackModal';

function EmptyHistoryVector() {
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
        <linearGradient id="suitGrad" x1="25" y1="35" x2="105" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EEF2FF" />
          <stop stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="handleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6366F1" />
          <stop stopColor="#4941EC" />
        </linearGradient>
      </defs>
      {/* Suitcase Handle */}
      <path
        d="M50 35V20C50 17 52 15 55 15H75C78 15 80 17 80 20V35"
        stroke="url(#handleGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Suitcase Body */}
      <rect
        x="24"
        y="35"
        width="82"
        height="56"
        rx="12"
        fill="url(#suitGrad)"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      {/* Corner Protectors */}
      <path d="M24 45C24 39.477 28.477 35 34 35H38V49H24V45Z" fill="#C7D2FE" />
      <path d="M106 45C106 39.477 101.523 35 96 35H92V49H106V45Z" fill="#C7D2FE" />
      <path d="M24 81C24 86.523 28.477 91 34 91H38V77H24V81Z" fill="#C7D2FE" />
      <path d="M106 81C106 86.523 101.523 91 96 91H92V77H106V81Z" fill="#C7D2FE" />

      {/* Center Straps */}
      <rect x="44" y="35" width="6" height="56" fill="#A5B4FC" opacity="0.6" />
      <rect x="80" y="35" width="6" height="56" fill="#A5B4FC" opacity="0.6" />

      {/* Travel Sticker - Round Green */}
      <circle cx="65" cy="55" r="9" fill="#10B981" />
      <path d="M62 55L64.5 57.5L68 53" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Travel Sticker - Star Orange */}
      <rect x="52" y="68" width="14" height="10" rx="3" fill="#F59E0B" />
      <path d="M56 73H62" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* Floating Camera in Corner */}
      <g transform="translate(82, 60)">
        <rect x="0" y="4" width="26" height="18" rx="4" fill="#4941EC" />
        <rect x="6" y="0" width="8" height="4" rx="1.5" fill="#312E81" />
        <circle cx="13" cy="13" r="5" fill="#EEF2FF" />
        <circle cx="13" cy="13" r="2.5" fill="#4941EC" />
        <circle cx="21" cy="7" r="1" fill="#60CE9F" />
      </g>
      {/* Decorative Sparkle */}
      <circle cx="18" cy="30" r="2" fill="#60CE9F" />
      <circle cx="114" cy="46" r="1.5" fill="#F59E0B" />
    </svg>
  );
}

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
  wishlistCount = 0,
  className = '',
}: TripHistoryScreenProps) {
  const [reviewTrip, setReviewTrip] = React.useState<TripItem | null>(null);

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
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Riwayat Perjalanan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Lihat kembali trip yang sudah selesai
            </p>
          </div>

          {/* Circle Counter */}
          <div className="w-7 h-7 rounded-full border border-[#4941EC] text-[#4941EC] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
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
          /* State 2: Empty State - Pemberitahuan untuk mulai lakukan perjalanan (No fill container, 2D vector) */
          <div className="py-8 sm:py-12 text-center flex flex-col items-center gap-2.5 my-auto select-none animate-in fade-in duration-300">
            <EmptyHistoryVector />
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight mt-2">
                Belum Ada Riwayat Perjalanan
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                Rencana perjalanan yang telah kamu selesaikan akan otomatis tersimpan di sini. Yuk, mulai buat rencana dan lakukan perjalanan pertamamu!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToRencana?.()}
              className="mt-3 w-full max-w-[260px] py-3.5 px-4 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
            >
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
                      <span className="bg-[#EEF0FF] text-[#4941EC] text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[150px]">
                        {trip.category || 'Wisata Alam & Terbuka'}
                      </span>
                      <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0">
                        {trip.status}
                      </span>
                    </div>

                    <h2 className="text-base font-semibold text-gray-900 truncate mb-1">
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
                <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-gray-100 flex-wrap gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Selesai {formatCompletedDayDate(trip.completedDate)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReviewTrip(trip);
                      }}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-200/80 transition-all cursor-pointer"
                    >
                      Ulas Perjalanan
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrip?.(trip);
                      }}
                      className="px-4 py-2 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Lihat Perjalanan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Ulas Perjalanan */}
      <FeedbackModal
        isOpen={!!reviewTrip}
        onClose={() => setReviewTrip(null)}
        initialCategory="other"
        initialTripTitle={reviewTrip ? `Perjalanan: ${reviewTrip.title}` : ''}
      />

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
