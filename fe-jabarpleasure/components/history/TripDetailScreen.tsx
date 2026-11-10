'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Check,
  Camera,
  PlayCircle,
  Download,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TripItem, DestinationItem } from '@/components/history/historyData';
import JournalMediaModal from '@/components/history/JournalMediaModal';

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
  onUpdateTrip,
  onViewTimelapse,
  onViewShowcase,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToRencana,
  onNavigateToMap,
  onNavigateToProfile,
  wishlistCount = 4,
  className = '',
}: TripDetailScreenProps) {
  const [currentTrip, setCurrentTrip] = useState<TripItem>(trip);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Keep state synced with trip prop if it changes
  useEffect(() => {
    setCurrentTrip(trip);
  }, [trip]);

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

  const handleDownloadTrip = () => {
    try {
      const summaryContent = [
        `======================================================`,
        `         DOKUMENTASI PERJALANAN JABARPLEASURE         `,
        `======================================================`,
        `Judul Rencana: ${currentTrip.title}`,
        `Kategori POI : ${currentTrip.category || 'Wisata Alam & Terbuka'}`,
        `Lokasi       : ${currentTrip.location}`,
        `Durasi       : ${currentTrip.duration} (${currentTrip.dateRange})`,
        `Status       : ${currentTrip.status} (${currentTrip.completedDate})`,
        `Statistik    : ${currentTrip.stats.destinations} Destinasi | ${currentTrip.stats.photos} Foto | ${currentTrip.stats.video} Video`,
        ``,
        `--- DAFTAR DESTINASI & CATATAN JURNAL ---`,
        ...(currentTrip.destinations || []).map((d, i) =>
          `\n[${i + 1}] ${d.name}\n` +
          `    Waktu Kunjungan: ${d.visitTime || d.time}\n` +
          `    Lokasi         : ${d.location}\n` +
          `    Catatan        : ${d.notes || '-'}\n` +
          `    Media/Foto     : ${d.photos?.length || 0} terlampir\n` +
          (d.photos && d.photos.length > 0
            ? d.photos.map((p, pIdx) => `      - Foto ${pIdx + 1}: "${p.caption || 'Tanpa keterangan'}"`).join('\n')
            : '      - Belum ada foto.')
        ),
        ``,
        `======================================================`,
        `Diekspor dari Aplikasi JabarPleasure WebGIS Platform`,
        `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        `======================================================`,
      ].join('\n');

      const blob = new Blob([summaryContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jurnal-${currentTrip.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadFeedback(`Dokumentasi ${currentTrip.title} berhasil diunduh!`);
      setTimeout(() => setDownloadFeedback(null), 3000);
    } catch {
      setDownloadFeedback(`Gagal mengunduh ringkasan.`);
      setTimeout(() => setDownloadFeedback(null), 3000);
    }
  };

  const handleSaveJournal = (
    updates: Record<string, { media: { url: string; caption: string; isVideo?: boolean }[]; notes?: string }>
  ) => {
    const updatedDestinations = currentTrip.destinations.map((d) => {
      const update = updates[d.id];
      if (!update) return d;
      return {
        ...d,
        notes: update.notes !== undefined && update.notes.trim() !== '' ? update.notes : d.notes,
        photos: update.media.map((m) => ({
          url: m.url,
          caption: m.caption,
          subCaption: d.name,
          isVideo: m.isVideo,
        })),
        photoCount: update.media.length,
      };
    });

    const totalPhotos = updatedDestinations.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0);
    const totalVideos = updatedDestinations.reduce(
      (acc, curr) => acc + (curr.photos?.filter((p) => p.isVideo)?.length || 0),
      0
    );

    const nextTrip: TripItem = {
      ...currentTrip,
      destinations: updatedDestinations,
      stats: {
        ...currentTrip.stats,
        photos: totalPhotos,
        video: totalVideos,
      },
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('jabarpleasure_trip_history');
        if (stored) {
          const list: TripItem[] = JSON.parse(stored);
          const nextList = list.map((item) => (item.id === nextTrip.id ? nextTrip : item));
          localStorage.setItem('jabarpleasure_trip_history', JSON.stringify(nextList));
        }
      } catch (e) {
        console.warn('Failed saving trip update to localStorage:', e);
      }
    }

    setCurrentTrip(nextTrip);
    onUpdateTrip?.(nextTrip);
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
                  ? `Mulai ${currentTrip.dateRange.replace('–', ' s/d ').replace('-', ' s/d ')} • ${currentTrip.duration}`
                  : `${currentTrip.dateRange} • ${currentTrip.duration}`}
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
        </div>

        {/* 3 Action Buttons per Requirement: Kelola Media Jurnal, Timelapse Perjalanan, Download Perjalanan */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Button 1: Kelola Media Jurnal */}
          <button
            type="button"
            onClick={() => setIsJournalModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white border border-gray-200 hover:border-[#4941EC] hover:bg-[#EEF0FF]/40 text-gray-800 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Camera className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold text-gray-900 leading-tight">
              Kelola Media Jurnal
            </span>
          </button>

          {/* Button 2: Timelapse Perjalanan (mengarah ke video perjalanan) */}
          <button
            type="button"
            onClick={() => (onViewTimelapse || onViewShowcase)?.(currentTrip)}
            className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white border border-gray-200 hover:border-[#10B981] hover:bg-emerald-50/40 text-gray-800 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <PlayCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold text-gray-900 leading-tight">
              Timelapse Perjalanan
            </span>
          </button>

          {/* Button 3: Download Perjalanan */}
          <button
            type="button"
            onClick={handleDownloadTrip}
            className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50/40 text-gray-800 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Download className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold text-gray-900 leading-tight">
              Download Perjalanan
            </span>
          </button>
        </div>

        {/* Download Feedback Alert if triggered */}
        {downloadFeedback && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-[#059669] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{downloadFeedback}</span>
          </div>
        )}

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
                  <span>{dest.photos?.length ?? dest.photoCount}</span>
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

      {/* Jurnal Media Perjalanan Modal Popup */}
      <JournalMediaModal
        isOpen={isJournalModalOpen}
        trip={currentTrip}
        onClose={() => setIsJournalModalOpen(false)}
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

