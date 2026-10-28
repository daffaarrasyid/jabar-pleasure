'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TRIP_HISTORY_DATA, TripItem } from '@/components/history/historyData';

interface TripHistoryScreenProps {
  trips?: TripItem[];
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

export default function TripHistoryScreen({
  trips = TRIP_HISTORY_DATA,
  onSelectTrip,
  onViewShowcase,
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
            {trips.length}
          </div>
        </div>

        {/* Trips List */}
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
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="80px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="text-base font-bold text-gray-900 truncate">
                      {trip.title}
                    </h2>
                    <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0">
                      {trip.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mb-1 truncate">
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      <span>{trip.duration}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span className="truncate">{trip.location}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 truncate">
                    {trip.stats.destinations} destinasi • {trip.stats.photos} foto • {trip.stats.video} video perjalanan
                  </p>
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
                {trip.initials.map((init, idx) => (
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
                  Selesai {trip.completedDate}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewShowcase?.(trip);
                  }}
                  className="px-4 py-2 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Lihat Perjalanan
                </button>
              </div>
            </div>
          ))}
        </div>
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
