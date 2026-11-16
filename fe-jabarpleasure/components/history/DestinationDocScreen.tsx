'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle2,
  Check,
  PlayCircle,
  Plus,
  Camera,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TripItem, DestinationItem } from '@/components/history/historyData';
import JournalMediaModal, { DestinationJournalUpdate } from '@/components/history/JournalMediaModal';
import { getUserTripHistoryKey } from '@/lib/auth';
import { formatHumanDate } from '@/lib/dateUtils';

const DEFAULT_DESTINATION: DestinationItem = {
  id: '',
  name: 'Destinasi Perjalanan',
  time: 'Selesai',
  status: 'Sudah dikunjungi',
  photoCount: 0,
  image: '/tugu-kujang.jpg',
  location: 'Jawa Barat',
  visitDate: 'Hari ini',
  visitTime: 'Selesai',
  notes: 'Belum ada catatan perjalanan untuk destinasi ini.',
  photos: [],
};

const DEFAULT_TRIP: TripItem = {
  id: '',
  title: 'Perjalanan',
  status: 'Selesai',
  duration: '1 hari',
  dateRange: 'Hari ini',
  location: 'Jawa Barat',
  completedDate: 'Hari ini',
  stats: {
    destinations: 0,
    photos: 0,
    video: 0,
  },
  initials: ['JP'],
  image: '/tugu-kujang.jpg',
  destinations: [],
};

interface DestinationDocScreenProps {
  trip?: TripItem;
  destination?: DestinationItem;
  onBack?: () => void;
  onViewShowcase?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToRencana?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  onUpdateTrip?: (updatedTrip: TripItem) => void;
  wishlistCount?: number;
  className?: string;
}

export default function DestinationDocScreen({
  trip = DEFAULT_TRIP,
  destination = DEFAULT_DESTINATION,
  onBack,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToRencana,
  onNavigateToMap,
  onNavigateToProfile,
  onUpdateTrip,
  wishlistCount = 0,
  className = '',
}: DestinationDocScreenProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const handleSaveJournal = (updates: Record<string, DestinationJournalUpdate>) => {
    const updatedDestinations = (trip.destinations || []).map((dest) => {
      const update = updates[dest.id];
      if (update) {
        return {
          ...dest,
          notes: update.notes !== undefined ? update.notes : dest.notes,
          photos: update.media.map((m) => ({
            url: m.url,
            caption: m.caption,
            isVideo: m.isVideo,
          })),
          photoCount: update.media.length,
        };
      }
      return dest;
    });

    const updatedTrip: TripItem = {
      ...trip,
      destinations: updatedDestinations,
      stats: {
        ...trip.stats,
        photos: updatedDestinations.reduce((acc, d) => acc + (d.photos?.length || 0), 0),
      },
    };

    const historyKey = getUserTripHistoryKey();
    try {
      const stored = localStorage.getItem(historyKey);
      if (stored) {
        const parsed: TripItem[] = JSON.parse(stored);
        const nextList = parsed.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
        localStorage.setItem(historyKey, JSON.stringify(nextList));
      }
    } catch {
      // ignore
    }

    onUpdateTrip?.(updatedTrip);
  };

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
            aria-label={`Kembali ke ${trip.title}`}
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-gray-400 font-medium block">
              Kembali ke {trip.title}
            </span>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              Dokumentasi Destinasi
            </h1>
          </div>
        </div>

        {/* Hero Image & Destination Info Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4">
          <div className="relative w-full aspect-[16/9] bg-gray-100">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              className="object-cover"
              sizes="440px"
              priority
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {destination.name}
              </h2>
              <span className="bg-[#D1FAE5] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Dikunjungi</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{destination.location} • {trip.title}</span>
            </div>
          </div>
        </div>

        {/* Catatan Kunjungan Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Catatan kunjungan
            </h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tersimpan</span>
            </span>
          </div>

          {/* Tanggal kunjungan */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium block mb-1">
              Tanggal kunjungan
            </label>
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-800">
                {formatHumanDate(destination.visitDate)}
              </span>
            </div>
          </div>

          {/* Status kunjungan (menggantikan waktu kunjungan per requirement) */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium block mb-1">
              Status kunjungan
            </label>
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-xs font-bold text-gray-800">
                  {destination.status || 'Sudah dikunjungi'}
                </span>
              </div>
              <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                Terkonfirmasi
              </span>
            </div>
          </div>

          {/* Catatan perjalanan */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium block mb-1">
              Catatan perjalanan
            </label>
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-700 leading-relaxed font-normal">
                {destination.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Dokumentasi Kunjungan Photos Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Dokumentasi kunjungan
              </h3>
              <p className="text-[11px] text-gray-500">
                Foto dan video kenangan di lokasi ini
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              className="px-2.5 py-1.5 bg-white hover:bg-[#EEF2FF] border border-[#4941EC]/30 text-[#4941EC] font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah Media</span>
            </button>
          </div>

          {/* Media Grid with Captions */}
          {destination.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {destination.photos.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative bg-[#F8FAFC] rounded-xl overflow-hidden border border-gray-100 shadow-2xs flex flex-col"
                >
                  <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                    {item.isVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                        <PlayCircle className="w-7 h-7 text-[#60CE9F]" />
                        <span className="text-[10px] font-bold mt-1">Video</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  {item.caption && (
                    <div className="p-1.5 bg-white border-t border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-800 line-clamp-1" title={item.caption}>
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Add more photo card */}
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#4941EC] hover:bg-[#EEF2FF]/40 flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#4941EC]/10 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-[#4941EC]" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 group-hover:text-[#4941EC]">
                  Tambah Media
                </span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100 flex flex-col items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-gray-400" />
              <p className="text-xs text-gray-500">
                Belum ada media terlampir untuk destinasi ini.
              </p>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="mt-1 px-3 py-1.5 bg-[#4941EC] hover:bg-[#3D35D9] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Foto / Video</span>
              </button>
            </div>
          )}

          <p className="text-[11px] text-gray-500 mt-1">
            {destination.photos.length} media {trip.title} • sudah dimasukkan
          </p>
        </div>
      </main>

      {/* Modal Kelola / Tambah Media untuk Destinasi */}
      <JournalMediaModal
        isOpen={isMediaModalOpen}
        trip={trip}
        initialDestinationId={destination.id}
        onClose={() => setIsMediaModalOpen(false)}
        onSaveJournal={handleSaveJournal}
      />

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
