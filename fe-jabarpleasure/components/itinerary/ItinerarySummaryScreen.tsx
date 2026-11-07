'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Bookmark,
  Navigation,
  GripVertical,
  Check,
  AlertTriangle,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';

const ItineraryRouteMap = dynamic(
  () => import('@/components/itinerary/ItineraryRouteMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 animate-pulse border border-gray-200">
        Memuat peta rute Leaflet...
      </div>
    ),
  }
);

export interface RouteWaypoint {
  id: string;
  name: string;
  address: string;
  role: string;
  orderNumber?: number;
  lat?: number;
  lng?: number;
}

interface ItinerarySummaryScreenProps {
  planTitle?: string;
  originName?: string;
  originLat?: number;
  originLng?: number;
  waypoints?: RouteWaypoint[];
  onBack?: () => void;
  onEditDestinations?: () => void;
  onDeleteTrip?: () => void;
  onSaveTrip?: (title: string, waypoints: RouteWaypoint[]) => void;
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

export default function ItinerarySummaryScreen({
  planTitle = 'Sehari di Bogor',
  originName = 'Stasiun Bogor',
  originLat = -6.595,
  originLng = 106.7972,
  waypoints = DEFAULT_WAYPOINTS,
  onBack,
  onEditDestinations,
  onDeleteTrip,
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
  const [totalKm, setTotalKm] = useState<number>(3.1);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    if (planTitle) setTitle(planTitle);
  }, [planTitle]);

  useEffect(() => {
    if (waypoints && waypoints.length > 0) {
      setRouteList(waypoints);
    }
  }, [waypoints]);

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

  // Drag and Drop reordering handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setRouteList((prev) => {
      const copy = [...prev];
      const [draggedItem] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, draggedItem);
      return copy.map((item, idx) => ({
        ...item,
        orderNumber: idx + 1,
        role:
          idx === 0
            ? 'Destinasi pertama'
            : idx === 1
            ? 'Destinasi kedua'
            : `Destinasi ke-${idx + 1}`,
      }));
    });
    setDraggedIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setRouteList((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({
        ...item,
        orderNumber: idx + 1,
        role:
          idx === 0
            ? 'Destinasi pertama'
            : idx === 1
            ? 'Destinasi kedua'
            : `Destinasi ke-${idx + 1}`,
      }));
    });
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
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              {routeList.length} destinasi · Total rute ±{totalKm} km
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

        {/* Real Leaflet WebGIS Map Component with OSRM Road Polyline */}
        <div className="mb-4">
          <ItineraryRouteMap
            origin={{
              name: originName,
              lat: originLat,
              lng: originLng,
            }}
            waypoints={routeList}
            onRouteCalculated={(dist) => {
              if (dist > 0) setTotalKm(dist);
            }}
          />
        </div>

        {/* Rute Perjalanan Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-3.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              Rute perjalanan
            </h3>
            <span className="text-[11px] text-gray-400 font-medium">
              Tarik atau drag tombol grip untuk urutan
            </span>
          </div>

          {/* Connected Waypoints Timeline */}
          <div className="relative flex flex-col gap-3.5">
            {/* Vertical connector line */}
            <div className="absolute left-3.5 top-5 bottom-4 w-0.5 bg-gray-200 -z-0" />

            {/* Titik Keberangkatan */}
            <div className="relative flex items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#E6F8F0] border border-[#60CE9F] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {originName}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">
                    Titik keberangkatan awal
                  </p>
                </div>
              </div>
            </div>

            {/* Reorderable Destinations */}
            {routeList.map((stop, index) => {
              const isFirstStop = index === 0;

              return (
                <div
                  key={stop.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`relative flex items-center justify-between gap-3 z-10 p-1.5 -mx-1.5 rounded-xl transition-all ${
                    draggedIndex === index
                      ? 'bg-[#EEF2FF] border-2 border-dashed border-[#4941EC] opacity-60'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Badge 1, 2, 3... */}
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

                  {/* Grip Vertical Drag Button */}
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    className="text-gray-400 hover:text-[#4941EC] active:text-[#4941EC] cursor-grab active:cursor-grabbing p-1.5 shrink-0 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Drag atau klik untuk mengubah urutan"
                    aria-label={`Ubah urutan ${stop.name}`}
                  >
                    <GripVertical className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary Buttons Grid: "Edit destinasi" & "Hapus perjalanan" */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          {/* Edit Destinasi (kembali ke seleksi destinasi tanpa mereset yang sudah dipilih) */}
          <button
            type="button"
            onClick={onEditDestinations || onBack}
            className="py-2.5 px-3 bg-white hover:bg-gray-50 border border-[#4941EC] text-[#4941EC] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Edit destinasi</span>
          </button>

          {/* Hapus Perjalanan (bg putih, border merah, teks merah) */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="py-2.5 px-3 bg-white hover:bg-red-50 border-2 border-red-500 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Hapus perjalanan</span>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Simpan Perjalanan Button */}
          <button
            type="button"
            onClick={() => onSaveTrip?.(title, routeList)}
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

      {/* Confirmation Modal: Hapus Perjalanan */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl flex flex-col gap-3 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-gray-900">
                Hapus Rencana Perjalanan?
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Rencana ini akan dihapus dan destinasi yang telah kamu susun tidak akan disimpan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteTrip?.();
                }}
                className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Ya, Hapus
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
