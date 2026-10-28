'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Plus,
  SlidersHorizontal,
  Bookmark,
  Navigation,
  GripVertical,
  Check,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import RouteMapIllustration from '@/components/itinerary/RouteMapIllustration';

export interface RouteWaypoint {
  id: string;
  name: string;
  address: string;
  role: string;
  orderNumber?: number;
}

interface ItinerarySummaryScreenProps {
  planTitle?: string;
  originName?: string;
  waypoints?: RouteWaypoint[];
  onBack?: () => void;
  onAddMoreDestinations?: () => void;
  onSaveTrip?: () => void;
  onStartTrip?: () => void;
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

export default function ItinerarySummaryScreen({
  planTitle = 'Sehari di Bogor',
  originName = 'Stasiun Bogor',
  waypoints = DEFAULT_WAYPOINTS,
  onBack,
  onAddMoreDestinations,
  onSaveTrip,
  onStartTrip,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRiwayat,
  wishlistCount = 3,
  className = '',
}: ItinerarySummaryScreenProps) {
  const [title, setTitle] = useState(planTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [routeList, setRouteList] = useState<RouteWaypoint[]>(waypoints);

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

  const handleSwapOrder = () => {
    if (routeList.length >= 2) {
      setRouteList((prev) => {
        const copy = [...prev];
        const temp = copy[0];
        copy[0] = copy[1];
        copy[1] = temp;
        return copy.map((item, idx) => ({
          ...item,
          orderNumber: idx + 1,
          role: idx === 0 ? 'Destinasi pertama' : idx === 1 ? 'Destinasi kedua' : `Destinasi ke-${idx + 1}`,
        }));
      });
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
              Ringkasan rencana
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Rutenya siap, tinggal pilih kapan berangkat
            </p>
          </div>
        </div>

        {/* Step Wizard Bar (Step 3: Ringkasan is ACTIVE) */}
        <div className="flex flex-col gap-1.5 mb-3.5 select-none">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1 bg-[#4941EC] rounded-full" />
            <div className="h-1 bg-[#4941EC] rounded-full" />
            <div className="h-1 bg-[#4941EC] rounded-full" />
          </div>
          <div className="grid grid-cols-3 text-center">
            <span className="text-xs font-medium text-gray-400">
              Keberangkatan
            </span>
            <span className="text-xs font-medium text-gray-400">
              Destinasi
            </span>
            <span className="text-xs font-bold text-[#4941EC]">
              Ringkasan
            </span>
          </div>
        </div>

        {/* Plan Title & Metadata with Edit Capability */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base font-bold text-gray-900 bg-white border border-[#4941EC] rounded-lg px-2 py-0.5 focus:outline-none w-full"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 bg-[#4941EC] text-white rounded-md cursor-pointer hover:bg-[#3D35D9]"
                  title="Simpan nama"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {title}
              </h2>
            )}
            <p className="text-xs text-gray-500 mt-0.5">
              {routeList.length} destinasi · Total rute ±3,1 km
            </p>
          </div>
          {!isEditingTitle && (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-[#4941EC] hover:text-[#3D35D9] p-1 rounded-md hover:bg-[#EEF2FF] transition-colors cursor-pointer mt-0.5"
              title="Ubah judul rencana"
            >
              <Pencil className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}
        </div>

        {/* Schematic Route Map Illustration Card */}
        <div className="mb-4">
          <RouteMapIllustration originName={originName} />
        </div>

        {/* Rute Perjalanan Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-3.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              Rute perjalanan
            </h3>
            <button
              type="button"
              onClick={handleSwapOrder}
              className="text-xs font-semibold text-[#4941EC] hover:underline cursor-pointer"
            >
              Ubah urutan
            </button>
          </div>

          {/* Connected Waypoints Timeline */}
          <div className="relative flex flex-col gap-3.5">
            {/* Vertical connector line */}
            <div className="absolute left-3.5 top-5 bottom-4 w-0.5 bg-gray-200 -z-0" />

            {/* Titik Keberangkatan */}
            <div className="relative flex items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Dot Icon badge */}
                <div className="w-7 h-7 rounded-full bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#4941EC]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {originName}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">
                    Titik keberangkatan · Bogor Tengah
                  </p>
                </div>
              </div>
            </div>

            {/* Destinations */}
            {routeList.map((stop, index) => {
              const isFirstStop = index === 0;

              return (
                <div
                  key={stop.id}
                  className="relative flex items-center justify-between gap-3 z-10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Badge 1 or 2 */}
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
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {stop.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate">
                        {stop.address} · {stop.role}
                      </p>
                    </div>
                  </div>

                  {/* Grip / Drag icon handle */}
                  <div className="text-gray-400 hover:text-gray-600 cursor-grab p-1 shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary Buttons Grid (Tambah destinasi & Revisi daftar) */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <button
            type="button"
            onClick={onAddMoreDestinations || onBack}
            className="py-2.5 px-3 bg-white hover:bg-gray-50 border border-[#4941EC] text-[#4941EC] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah destinasi</span>
          </button>
          <button
            type="button"
            onClick={handleSwapOrder}
            className="py-2.5 px-3 bg-white hover:bg-gray-50 border border-[#4941EC] text-[#4941EC] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Revisi daftar</span>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Simpan Perjalanan Button */}
          <button
            type="button"
            onClick={onSaveTrip}
            className="w-full py-3 bg-white hover:bg-gray-50 border-2 border-[#4941EC] text-[#4941EC] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <Bookmark className="w-4 h-4 stroke-[2.2]" />
            <span>Simpan perjalanan</span>
          </button>

          {/* Lakukan Perjalanan Button */}
          <button
            type="button"
            onClick={onStartTrip}
            className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-white stroke-[1.5]" />
            <span>Lakukan perjalanan</span>
          </button>

          <p className="text-[11px] text-gray-500 text-center font-medium mt-0.5">
            Simpan untuk nanti atau mulai perjalanan sekarang.
          </p>
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
