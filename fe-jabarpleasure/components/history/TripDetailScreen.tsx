'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TRIP_HISTORY_DATA, TripItem, DestinationItem } from '@/components/history/historyData';

interface TripDetailScreenProps {
  trip?: TripItem;
  onBack?: () => void;
  onSelectDestination?: (dest: DestinationItem) => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToRencana?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  wishlistCount?: number;
  className?: string;
}

export default function TripDetailScreen({
  trip = TRIP_HISTORY_DATA[0],
  onBack,
  onSelectDestination,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToRencana,
  onNavigateToMap,
  onNavigateToProfile,
  wishlistCount = 4,
  className = '',
}: TripDetailScreenProps) {
  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'rencana') {
      onNavigateToRencana?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onNavigateToProfile?.();
    } else if (tab === 'riwayat') {
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
        {/* Back Button with context breadcrumb */}
        <div className="flex items-start gap-2.5 mb-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali ke Riwayat"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-gray-400 font-medium block">
              Kembali ke Riwayat
            </span>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight truncate">
              {trip.title}
            </h1>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3 mb-4">
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={trip.image}
                alt={trip.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                  {trip.title}
                </h2>
                <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{trip.status}</span>
                </span>
              </div>

              <p className="text-[11px] text-gray-500 font-medium truncate">
                {trip.dateRange} • {trip.duration}
              </p>

              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{trip.location}</span>
              </div>

              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                Selesai {trip.completedDate}
              </p>
            </div>
          </div>

          {/* 3 Stats Columns Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
            <div className="bg-[#F8FAFC] rounded-xl py-2 px-1">
              <span className="text-sm font-bold text-[#4941EC] block leading-tight">
                {trip.stats.destinations}
              </span>
              <span className="text-[10px] text-gray-500">destinasi</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl py-2 px-1">
              <span className="text-sm font-bold text-[#4941EC] block leading-tight">
                {trip.stats.photos}
              </span>
              <span className="text-[10px] text-gray-500">foto</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl py-2 px-1">
              <span className="text-sm font-bold text-[#4941EC] block leading-tight">
                {trip.stats.video}
              </span>
              <span className="text-[10px] text-gray-500">video perjalanan</span>
            </div>
          </div>
        </div>

        {/* Destinasi yang dikunjungi Heading */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Destinasi yang dikunjungi
            </h3>
            <p className="text-[11px] text-gray-500">
              Pilih destinasi untuk melihat catatan dan dokumentasi.
            </p>
          </div>
          <span className="text-xs font-bold text-[#4941EC]">
            {trip.destinations.length}/{trip.destinations.length}
          </span>
        </div>

        {/* Destination Items List */}
        <div className="flex flex-col gap-2.5 mb-4">
          {trip.destinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => onSelectDestination?.(dest)}
              className="bg-white rounded-2xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="56px"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {dest.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {dest.time}
                  </p>
                  <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>{dest.status}</span>
                  </span>
                </div>
              </div>

              {/* Right Action: Photo count & Arrow */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{dest.photoCount}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4941EC] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Completion Message */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium px-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.2] shrink-0" />
          <span>Semua destinasi selesai. Kenanganmu tersimpan di sini.</span>
        </div>
      </main>

      {/* 3. Bottom Navigation Bar with Riwayat Active */}
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
