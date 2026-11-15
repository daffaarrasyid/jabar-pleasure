'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Flame,
  Compass,
  Camera,
  Heart,
} from 'lucide-react';
import InspectionModal, { PendingSubmission } from './InspectionModal';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatDot?: boolean;
}

function AnimatedNumber({
  value,
  duration = 1400,
  formatDot = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeProgress * value);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formatted = formatDot
    ? displayValue.toLocaleString('id-ID')
    : displayValue.toString();

  return <>{formatted}</>;
}

const CATEGORY_TRENDS = [
  {
    name: 'Wisata Alam & Terbuka',
    percentage: 78,
    color: 'bg-[#4941EC]',
    glowColor: 'group-hover/bar:shadow-[0_2px_8px_rgba(73,65,236,0.35)]',
  },
  {
    name: 'Modern & Lifestyle',
    percentage: 62,
    color: 'bg-[#EDAD40]',
    glowColor: 'group-hover/bar:shadow-[0_2px_8px_rgba(237,173,64,0.35)]',
  },
  {
    name: 'Publik & Edukasi',
    percentage: 45,
    color: 'bg-[#60CE9F]',
    glowColor: 'group-hover/bar:shadow-[0_2px_8px_rgba(96,206,159,0.35)]',
  },
  {
    name: 'Rekreasi Keluarga',
    percentage: 90,
    color: 'bg-[#3B82F6]',
    glowColor: 'group-hover/bar:shadow-[0_2px_8px_rgba(59,130,246,0.35)]',
  },
];

const MOCK_SUBMISSIONS: PendingSubmission[] = [
  {
    id: 1,
    name: 'Curug Tilu Leuwi Opat',
    submitter: '@julyandre',
    category: 'Wisata Alam & Terbuka',
    locationMethod: 'GPS Realtime',
    coordsOrUrl: 'Lat: -6.7925, Long: 107.5872',
    date: 'Hari ini, 09:24 WIB',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Dago Bakery Punclut',
    submitter: '@daffa_dev',
    category: 'Modern & Lifestyle',
    locationMethod: 'Link Google Maps',
    coordsOrUrl: 'https://maps.app.goo.gl/dagoBakeryPunclut',
    date: 'Kemarin, 16:45 WIB',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Kampung Kohod',
    submitter: '@rifaldi_pm',
    category: 'Rekreasi Keluarga',
    locationMethod: 'GPS Realtime',
    coordsOrUrl: 'Lat: -6.0428, Long: 106.6214',
    date: '3 Nov 2026, 11:10 WIB',
    status: 'pending',
  },
  {
    id: 4,
    name: 'Kampung Kohod',
    submitter: '@rifaldi_pm',
    category: 'Rekreasi Keluarga',
    locationMethod: 'GPS Realtime',
    coordsOrUrl: 'Lat: -6.0428, Long: 106.6214',
    date: '3 Nov 2026, 10:15 WIB',
    status: 'pending',
  },
];

interface SpatialRegionItem {
  rank: number;
  name: string;
  checkIns: number;
  itineraries: number;
  status: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Berkembang';
}

const TOP_SPATIAL_REGIONS: SpatialRegionItem[] = [
  {
    rank: 1,
    name: 'Kota Bandung',
    checkIns: 6840,
    itineraries: 1920,
    status: 'Sangat Tinggi',
  },
  {
    rank: 2,
    name: 'Kab. Bandung Barat',
    checkIns: 4210,
    itineraries: 1150,
    status: 'Sangat Tinggi',
  },
  {
    rank: 3,
    name: 'Kab. Bogor',
    checkIns: 3120,
    itineraries: 890,
    status: 'Tinggi',
  },
  {
    rank: 4,
    name: 'Kab. Garut',
    checkIns: 1950,
    itineraries: 540,
    status: 'Sedang',
  },
  {
    rank: 5,
    name: 'Kab. Kuningan',
    checkIns: 1200,
    itineraries: 310,
    status: 'Berkembang',
  },
];

interface LiveBehaviorLog {
  id: number;
  username: string;
  actionPrefix: string;
  target: string;
  timeAgo: string;
  type: 'checkin' | 'itinerary' | 'journal' | 'wishlist';
}

const LIVE_BEHAVIORAL_LOGS: LiveBehaviorLog[] = [
  {
    id: 1,
    username: '@julyandre',
    actionPrefix: 'melakukan Check-in di',
    target: 'Taman Hutan Raya Djuanda',
    timeAgo: '5 menit yang lalu',
    type: 'checkin',
  },
  {
    id: 2,
    username: '@daffa_dev',
    actionPrefix: 'menyusun Rencana Perjalanan',
    target: '"Eksplor Lembang"',
    timeAgo: '12 menit yang lalu',
    type: 'itinerary',
  },
  {
    id: 3,
    username: '@rifaldi_pm',
    actionPrefix: 'mengunggah foto Journaling di',
    target: 'Museum Geologi Bandung',
    timeAgo: '25 menit yang lalu',
    type: 'journal',
  },
  {
    id: 4,
    username: '@sarah_traveler',
    actionPrefix: 'menambahkan destinasi ke Wishlist',
    target: 'Kawah Putih Ciwidey',
    timeAgo: '34 menit yang lalu',
    type: 'wishlist',
  },
];

export default function AdminOverview() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>(MOCK_SUBMISSIONS);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLinesAnimated, setIsLinesAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLinesAnimated(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenInspection = (sub: PendingSubmission) => {
    setSelectedSubmission(sub);
    setIsModalOpen(true);
  };

  const handleApprove = (id: number | string) => {
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
    setIsModalOpen(false);
    showToast('Pengajuan destinasi disetujui & dipublikasikan ke peta.');
  };

  const handleReject = (id: number | string) => {
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
    setIsModalOpen(false);
    showToast('Pengajuan destinasi ditolak.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-[#60CE9F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
          Overview Kinerja & Ringkasan Sistem
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Metrik operasional real-time JabarPleasure
        </p>
      </div>

      {/* 4 KPI Metric Cards with Smooth Counting & Tactile Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total POI */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(73,65,236,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(73,65,236,0.35)]">
            <MapPin className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total POI</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={1250} />
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125" />{' '}
                <AnimatedNumber value={24} duration={1000} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              POI terverifikasi bulan ini
            </p>
          </div>
        </div>

        {/* Card 2: Pengajuan menunggu */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#EDAD40] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(237,173,64,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(237,173,64,0.35)]">
            <Clock className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Pengajuan menunggu</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={5} duration={800} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              memerlukan validasi kurator
            </p>
          </div>
        </div>

        {/* Card 3: Total Pengguna */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#60CE9F] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(96,206,159,0.3)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(96,206,159,0.35)]">
            <Users className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total Pengguna</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={4580} />
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125" />{' '}
                <AnimatedNumber value={312} duration={1000} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              pengguna baru minggu ini
            </p>
          </div>
        </div>

        {/* Card 4: Masukan Baru */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(59,130,246,0.35)]">
            <MessageCircle className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Masukan Baru</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={8} duration={800} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              ulasan & masukan komunitas
            </p>
          </div>
        </div>
      </div>

      {/* Two Large Side-by-Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analitik Perilaku & Tren Kategori (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                Analitik Perilaku & Tren Kategori
              </h2>
              <span className="text-xs font-semibold text-[#4941EC]">
                Top Clicks
              </span>
            </div>

            {/* Smooth Animated Category Progress Lines */}
            <div className="space-y-4">
              {CATEGORY_TRENDS.map((cat, idx) => (
                <div
                  key={cat.name}
                  className="group/bar p-2 -mx-2 rounded-xl hover:bg-gray-50/70 transition-colors duration-200 cursor-default"
                >
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-gray-800 group-hover/bar:text-gray-900 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-gray-900 font-semibold group-hover/bar:scale-105 transition-transform duration-200">
                      <AnimatedNumber
                        value={cat.percentage}
                        duration={1200}
                        formatDot={false}
                      />
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${cat.glowColor}`}
                      style={{
                        width: isLinesAnimated ? `${cat.percentage}%` : '0%',
                        transitionDelay: `${idx * 150}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <span className="text-[11px] text-gray-400">
              Data agregasi 30 hari terakhir
            </span>
            <button
              type="button"
              onClick={() => showToast('Mengunduh laporan analitik bulanan...')}
              className="group/link text-xs font-semibold text-[#4941EC] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Unduh Laporan</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/link:translate-x-1 group-hover/link:scale-115" />
            </button>
          </div>
        </div>

        {/* Right Column: Validasi Pengajuan Lokasi Baru (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                Validasi Pengajuan Lokasi Baru
              </h2>
              <span className="text-xs font-semibold text-[#4941EC]">
                {submissions.length} Antrean
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                    <th className="py-2.5 pr-2">Nama Destinasi</th>
                    <th className="py-2.5 px-2">Pengaju</th>
                    <th className="py-2.5 px-2">Kategori</th>
                    <th className="py-2.5 px-2">Metode Lokasi</th>
                    <th className="py-2.5 pl-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="py-3 pr-2 font-medium text-gray-900">
                        {sub.name}
                      </td>
                      <td className="py-3 px-2 text-gray-600 font-medium">
                        {sub.submitter}
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4941EC] text-[10px] font-semibold whitespace-nowrap">
                          {sub.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                        {sub.locationMethod}
                      </td>
                      <td className="py-3 pl-2 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenInspection(sub)}
                          className="group/btn inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-[11px] font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3 h-3 text-gray-500 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/btn:scale-125" />
                          <span>Tinjau</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-xs text-gray-400"
                      >
                        Semua antrean pengajuan telah selesai diverifikasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <span className="text-[11px] text-gray-400">
              Sistem verifikasi spasial aktif
            </span>
            <button
              type="button"
              onClick={() => showToast('Membuka riwayat log pengajuan lokasi...')}
              className="group/link text-xs font-semibold text-[#4941EC] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Riwayat</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/link:translate-x-1 group-hover/link:scale-115" />
            </button>
          </div>
        </div>
      </div>

      {/* Second Bento Row: Distribusi Spasial (7 cols) & Aktivitas Komunitas Realtime (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Distribusi Spasial & Top 5 Kabupaten/Kota Terpopuler (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                  Distribusi Spasial & Top 5 Kabupaten/Kota Terpopuler
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Tingkat aktivitas ekspos pariwisata di 27 Kabupaten/Kota Jawa Barat
                </p>
              </div>
              <span className="text-xs font-semibold text-[#4941EC] hidden sm:inline-block">
                Trafik Spasial Real-time
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                    <th className="py-2.5 pr-2 w-8">No</th>
                    <th className="py-2.5 px-2">Kabupaten / Kota</th>
                    <th className="py-2.5 px-2">Total Check-in</th>
                    <th className="py-2.5 px-2">Rencana Perjalanan</th>
                    <th className="py-2.5 pl-2 text-right">Status Ekspos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {TOP_SPATIAL_REGIONS.map((item) => (
                    <tr
                      key={item.name}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="py-3 pr-2 text-gray-400 font-medium">
                        {item.rank}
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-2 font-mono text-gray-700">
                        <AnimatedNumber value={item.checkIns} />
                      </td>
                      <td className="py-3 px-2 font-mono text-gray-700">
                        <AnimatedNumber value={item.itineraries} />
                      </td>
                      <td className="py-3 pl-2 text-right whitespace-nowrap">
                        {item.status === 'Sangat Tinggi' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold">
                            <Flame className="w-3 h-3 text-red-500 fill-red-500" />
                            Sangat Tinggi
                          </span>
                        ) : item.status === 'Tinggi' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Tinggi
                          </span>
                        ) : item.status === 'Sedang' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Sedang
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Berkembang
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-5">
            <span className="text-[11px] text-gray-400">
              Kalkulasi spasial query PostGIS ST_DWithin
            </span>
            <button
              type="button"
              onClick={() => showToast('Membuka visualisasi peta sebaran ekspos...')}
              className="group/link text-xs font-semibold text-[#4941EC] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Peta Sebaran</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/link:translate-x-1 group-hover/link:scale-115" />
            </button>
          </div>
        </div>

        {/* Right Column: Aktivitas Komunitas Realtime (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                  Aktivitas Komunitas Realtime
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Live behavioral logs interaksi pengguna WebGIS
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Logs
              </span>
            </div>

            <div className="space-y-3">
              {LIVE_BEHAVIORAL_LOGS.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50/70 transition-colors group/item"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/item:scale-115 ${
                      log.type === 'checkin'
                        ? 'bg-emerald-50 text-emerald-600'
                        : log.type === 'itinerary'
                        ? 'bg-[#EEF2FF] text-[#4941EC]'
                        : log.type === 'journal'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {log.type === 'checkin' && <MapPin className="w-4 h-4" />}
                    {log.type === 'itinerary' && <Compass className="w-4 h-4" />}
                    {log.type === 'journal' && <Camera className="w-4 h-4" />}
                    {log.type === 'wishlist' && <Heart className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">
                      <span className="font-semibold text-gray-900 hover:text-[#4941EC] transition-colors cursor-pointer">
                        {log.username}
                      </span>{' '}
                      {log.actionPrefix}{' '}
                      <span className="font-medium text-gray-900 italic">
                        {log.target}
                      </span>
                    </p>
                    <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-300" />
                      {log.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-5">
            <span className="text-[11px] text-gray-400">
              Pembaruan log otomatis via WebSocket
            </span>
            <button
              type="button"
              onClick={() => showToast('Membuka audit trail aktivitas komunitas...')}
              className="group/link text-xs font-semibold text-[#4941EC] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua Log</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/link:translate-x-1 group-hover/link:scale-115" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal for Reviewing Submissions */}
      <InspectionModal
        isOpen={isModalOpen}
        submission={selectedSubmission}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
