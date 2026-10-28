'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Check,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TRIP_HISTORY_DATA, TripItem } from '@/components/history/historyData';

interface TripShowcaseScreenProps {
  trip?: TripItem;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToRencana?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  wishlistCount?: number;
  className?: string;
}

interface PhotoGalleryItem {
  id: string;
  destinationName: string;
  caption: string;
  image: string;
}

const GALLERY_ITEMS: PhotoGalleryItem[] = [
  {
    id: 'tp-1',
    destinationName: 'Tangkuban Perahu',
    caption: 'Kawah Ratu',
    image: '/tangkuban-parahu.jpg',
  },
  {
    id: 'tp-2',
    destinationName: 'Tangkuban Perahu',
    caption: 'Bersama teman',
    image: '/friends-crater.jpg',
  },
  {
    id: 'tp-3',
    destinationName: 'Tangkuban Perahu',
    caption: 'Kabut pagi',
    image: '/kawah-ratu.jpg',
  },
  {
    id: 'fm-1',
    destinationName: 'Floating Market',
    caption: 'Di tepi danau',
    image: '/floating-market.jpg',
  },
  {
    id: 'fm-2',
    destinationName: 'Floating Market',
    caption: 'Jajan sore',
    image: '/floating-market.jpg',
  },
  {
    id: 'fm-3',
    destinationName: 'Floating Market',
    caption: 'Naik perahu',
    image: '/floating-market.jpg',
  },
  {
    id: 'ps-1',
    destinationName: 'Puncak Sari',
    caption: 'Hijau sejauh mata',
    image: '/puncak-sari.jpg',
  },
  {
    id: 'ps-2',
    destinationName: 'Puncak Sari',
    caption: 'Momen di puncak',
    image: '/puncak-sari.jpg',
  },
  {
    id: 'db-1',
    destinationName: 'Dusun Bambu',
    caption: 'Pondok di danau',
    image: '/dusun-bambu.jpg',
  },
  {
    id: 'db-2',
    destinationName: 'Dusun Bambu',
    caption: 'Jalan santai',
    image: '/dusun-bambu.jpg',
  },
  {
    id: 'th-1',
    destinationName: 'Taman Hutan Raya',
    caption: 'Jelajah hutan',
    image: '/tahura-juanda.jpg',
  },
  {
    id: 'th-2',
    destinationName: 'Taman Hutan Raya',
    caption: 'Langkah terakhir',
    image: '/tahura-juanda.jpg',
  },
];

export default function TripShowcaseScreen({
  trip = TRIP_HISTORY_DATA[0],
  onBack,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToRencana,
  onNavigateToMap,
  onNavigateToProfile,
  wishlistCount = 4,
  className = '',
}: TripShowcaseScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');

  const handleTogglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      setCurrentTime(next ? '00:45' : '00:00');
      return next;
    });
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
            aria-label="Kembali ke Dokumentasi Destinasi"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-gray-400 font-medium block">
              Kembali ke Dokumentasi Destinasi
            </span>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Lihat Perjalanan
            </h1>
          </div>
        </div>

        {/* Trip Title & Metadata */}
        <div className="mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {trip.title}
            </h2>
            <span className="bg-[#D1FAE5] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{trip.status}</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            {trip.dateRange} • {trip.duration}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {trip.stats.destinations} destinasi • {trip.stats.photos} foto • {trip.stats.video} video perjalanan
          </p>
        </div>

        {/* Interactive Video Player Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4">
          {/* 16:9 Video Box */}
          <div className="relative w-full aspect-[16/9] bg-black overflow-hidden group select-none">
            <Image
              src="/tangkuban-parahu.jpg"
              alt="Video Preview"
              fill
              className="object-cover opacity-85 group-hover:scale-102 transition-transform duration-300"
              sizes="440px"
              priority
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Top-Left Badge: Pratinjau */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-semibold text-white/90">
              Pratinjau
            </div>

            {/* Center Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white flex items-center justify-center shadow-xl shadow-[#4941EC]/40 transition-all cursor-pointer z-10"
              title={isPlaying ? 'Jeda video' : 'Putar video'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-0.5" />
              )}
            </button>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1.5 z-10">
              {/* Timeline scrubber bar */}
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4941EC] rounded-full transition-all duration-300"
                  style={{ width: isPlaying ? '35%' : '0%' }}
                />
              </div>

              {/* Bottom buttons row */}
              <div className="flex items-center justify-between text-white text-[11px] pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="hover:text-[#60CE9F] transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>
                  <span className="font-mono text-[10px]">
                    {currentTime} / 02:34
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsMuted((m) => !m)}
                    className="hover:text-[#60CE9F] transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    className="hover:text-[#60CE9F] transition-colors cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description below video */}
          <div className="p-3.5">
            <h3 className="text-sm font-bold text-gray-900">
              {trip.videoTitle || 'Tiga hari, banyak cerita'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {trip.videoSubtitle || 'Video perjalanan Bandung Trip, bersama foto dan cerita yang sudah kamu masukkan.'}
            </p>
          </div>
        </div>

        {/* Dokumentasi Perjalanan Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-sm font-bold text-gray-900">
              Dokumentasi perjalanan
            </h3>
            <span className="text-xs text-[#4941EC] font-semibold">
              {GALLERY_ITEMS.length} foto
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            Kenangan dari {trip.stats.destinations} destinasi yang sudah dikunjungi.
          </p>

          {/* 3-Column Photo Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {GALLERY_ITEMS.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-2xs">
                  <Image
                    src={item.image}
                    alt={item.caption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="120px"
                  />
                </div>
                <div className="px-0.5">
                  <h4 className="text-[10px] font-bold text-gray-900 truncate">
                    {item.destinationName}
                  </h4>
                  <p className="text-[9px] text-gray-500 truncate">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Confirmation Banner */}
        <div className="bg-[#D1FAE5]/60 border border-[#A7F3D0] rounded-2xl p-3.5 flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.2] shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-gray-900">
              Perjalanan selesai pada {trip.completedDate}
            </h4>
            <p className="text-[11px] text-gray-600 truncate">
              Semua cerita {trip.title} tersimpan.
            </p>
          </div>
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
