'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Check,
  PlayCircle,
  Download,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TripItem, DestinationItem } from '@/components/history/historyData';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import { formatHumanDate, formatDestinationTime } from '@/lib/dateUtils';

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

interface TripDetailScreenProps {
  trip?: TripItem;
  onBack?: () => void;
  onSelectDestination?: (dest: DestinationItem) => void;
  onUpdateTrip?: (updatedTrip: TripItem) => void;
  onViewTimelapse?: (trip: TripItem) => void;
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

function cleanLocationText(loc: string): string {
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

export default function TripDetailScreen({
  trip = DEFAULT_TRIP,
  onBack,
  onSelectDestination,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToRencana,
  onNavigateToMap,
  onNavigateToProfile,
  wishlistCount = 0,
  className = '',
}: TripDetailScreenProps) {
  const router = useRouter();
  const [currentTrip, setCurrentTrip] = useState<TripItem>(trip);
  const [prevTrip, setPrevTrip] = useState<TripItem>(trip);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadTripMp4 = () => {
    setDownloadNotice('Menyiapkan ekspor video animasi perjalanan (.mp4)...');
    setTimeout(() => {
      setDownloadNotice('Video perjalanan (.mp4) siap diunduh!');
      setTimeout(() => {
        setDownloadNotice(null);
      }, 2500);
    }, 1800);
  };

  // Sync state if trip prop changes (official React pattern without effect)
  if (trip !== prevTrip) {
    setPrevTrip(trip);
    setCurrentTrip(trip);
  }

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
      {/* Feedback notice for MP4 download */}
      {downloadNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0B0F19]/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-white/10 flex items-center gap-2 backdrop-blur-md transition-all">
          <Download className="w-4 h-4 text-[#60CE9F] animate-bounce shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

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
              {currentTrip.title}
            </h1>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3 mb-3.5">
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={currentTrip.image}
                alt={currentTrip.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="bg-[#EEF0FF] text-[#4941EC] text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[150px]">
                  {currentTrip.category || 'Wisata Alam & Terbuka'}
                </span>
                <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>{currentTrip.status}</span>
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate mb-0.5">
                {currentTrip.title}
              </h2>

              <p className="text-[11px] text-gray-500 font-medium truncate">
                {currentTrip.duration.toLowerCase().includes('malam') ||
                  ((currentTrip.dateRange.includes('–') || currentTrip.dateRange.includes('-')) &&
                    !currentTrip.duration.toLowerCase().includes('1 hari'))
                  ? `Mulai ${formatHumanDate(currentTrip.dateRange.replace('–', ' s/d ').replace('-', ' s/d '))} • ${currentTrip.duration}`
                  : `${formatHumanDate(currentTrip.dateRange)} • ${currentTrip.duration}`}
              </p>

              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{cleanLocationText(currentTrip.location)}</span>
              </div>
            </div>
          </div>

          {/* 3 Stats Columns Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
            <div className="bg-[#F8FAFC] rounded-xl py-2 px-1">
              <span className="text-sm font-bold text-[#4941EC] block leading-tight">
                {currentTrip.stats.destinations}
              </span>
              <span className="text-[10px] text-gray-500">destinasi</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl py-2 px-1">
              <span className="text-sm font-bold text-[#4941EC] block leading-tight">
                {currentTrip.stats.photos}
              </span>
              <span className="text-[10px] text-gray-500">foto</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl py-2 px-1">
              <span className="text-sm font-bold text-[#4941EC] block leading-tight">
                {currentTrip.stats.video}
              </span>
              <span className="text-[10px] text-gray-500">video perjalanan</span>
            </div>
          </div>

          {/* Action Row: Timelapse Button + Secondary MP4 Download Button */}
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                router.push(`/history/${currentTrip.id || 'latest'}/timelapse`);
              }}
              className="flex-1 py-2.5 px-3 min-h-[44px] bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-[#4941EC]/20 transition-all cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-white shrink-0" />
              <span>Timelapse Perjalanan (3D Flyover)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTripMp4}
              title="Unduh video perjalanan (.mp4)"
              aria-label="Unduh video perjalanan (.mp4)"
              className="w-11 h-11 shrink-0 rounded-xl bg-white hover:bg-gray-50 active:scale-95 border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
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
            {currentTrip.destinations.length}/{currentTrip.destinations.length}
          </span>
        </div>

        {/* Destination Items List */}
        <div className="flex flex-col gap-2.5 mb-4">
          {currentTrip.destinations.map((dest) => (
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
                    {formatDestinationTime(dest.time, dest.visitDate)}
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
                  <span>{dest.photos?.length ?? dest.photoCount}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4941EC] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Completion Message & Ulas Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs mt-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.2] shrink-0" />
            <span>Semua destinasi selesai. Kenanganmu tersimpan di sini.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 shadow-2xs transition-all cursor-pointer text-center"
          >
            Ulas Perjalanan
          </button>
        </div>
      </main>

      {/* Modal Ulas Perjalanan */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        initialCategory="other"
        initialTripTitle={`Perjalanan: ${currentTrip.title}`}
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

