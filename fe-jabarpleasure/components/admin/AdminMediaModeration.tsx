'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderArchive,
  CheckCircle2,
  Trash2,
  Film,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  MapPin,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  Video,
  AlertTriangle,
} from 'lucide-react';

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

export type MediaModerationStatus = 'published' | 'deleted';
export type MediaType = 'photo' | 'video';
export type LocationMethod = 'gps' | 'maps_link';

export interface UserMediaContent {
  id: number;
  submitter: string;
  date: string;
  name: string;
  category: string;
  method: LocationMethod;
  locationDetail: string;
  district: string;
  mediaFileName: string;
  mediaType: MediaType;
  mediaSize: string;
  status: MediaModerationStatus;
  moderationReason?: string;
}

const INITIAL_MEDIA_CONTENTS: UserMediaContent[] = [
  {
    id: 1,
    submitter: '@julyandre',
    date: '12/10/2026, 09:24 WIB',
    name: 'Curug Tilu Leuwi Opat',
    category: 'Wisata Alam & Terbuka',
    method: 'gps',
    locationDetail: 'Lat: -6.8245, Long: 107.5789',
    district: 'Kec. Parongpong, Kab. Bandung Barat',
    mediaFileName: 'Foto_Curug_Tilu.jpg',
    mediaType: 'photo',
    mediaSize: '1.4 MB',
    status: 'published',
  },
  {
    id: 2,
    submitter: '@daffa_dev',
    date: '12/10/2026, 16:45 WIB',
    name: 'Dago Bakery Punclut',
    category: 'Modern & Lifestyle',
    method: 'maps_link',
    locationDetail: 'https://maps.app.goo.gl/vX9kLmA2qR8zP1',
    district: 'Kec. Cidadap, Kota Bandung',
    mediaFileName: 'DagoBakery_Castle.jpg',
    mediaType: 'photo',
    mediaSize: '1.8 MB',
    status: 'published',
  },
  {
    id: 3,
    submitter: '@rifaldi_pm',
    date: '11/10/2026, 10:15 WIB',
    name: 'Kampung Kohod',
    category: 'Rekreasi Keluarga',
    method: 'gps',
    locationDetail: 'Lat: -6.9175, Long: 107.6191',
    district: 'Kec. Sumur Bandung, Kota Bandung',
    mediaFileName: 'Suasana_Kampung_Kohod.mp4',
    mediaType: 'video',
    mediaSize: '7.2 MB',
    status: 'published',
  },
  {
    id: 4,
    submitter: '@bintang_gis',
    date: '10/10/2026, 14:20 WIB',
    name: 'Sanghyang Heuleut',
    category: 'Wisata Alam & Terbuka',
    method: 'gps',
    locationDetail: 'Lat: -6.8831, Long: 107.3451',
    district: 'Kec. Rajamandala Kulon, Kab. Bandung Barat',
    mediaFileName: 'Danau_Purba_Sanghyang.jpg',
    mediaType: 'photo',
    mediaSize: '1.9 MB',
    status: 'published',
  },
  {
    id: 5,
    submitter: '@user_nakal',
    date: '09/10/2026, 11:05 WIB',
    name: 'Cafe Non-Wisata Spammer',
    category: 'Modern & Lifestyle',
    method: 'maps_link',
    locationDetail: 'https://maps.app.goo.gl/zY8mPn1',
    district: 'Kec. Kebayoran Baru, Jakarta Selatan',
    mediaFileName: 'Gambar_Iklan_Spam.jpg',
    mediaType: 'photo',
    mediaSize: '2.4 MB',
    status: 'deleted',
    moderationReason: 'Foto berupa brosur promosi spam komersial di luar wilayah Jawa Barat.',
  },
  {
    id: 6,
    submitter: '@citra_lestari',
    date: '08/10/2026, 08:30 WIB',
    name: 'Tebing Keraton Sunrise',
    category: 'Wisata Alam & Terbuka',
    method: 'gps',
    locationDetail: 'Lat: -6.8339, Long: 107.6636',
    district: 'Kec. Cimenyan, Kab. Bandung Barat',
    mediaFileName: 'Sunrise_Kabut_Tebing.jpg',
    mediaType: 'photo',
    mediaSize: '1.1 MB',
    status: 'published',
  },
  {
    id: 7,
    submitter: '@eko_prasetyo',
    date: '07/10/2026, 13:40 WIB',
    name: 'Kawah Putih Ciwidey',
    category: 'Wisata Alam & Terbuka',
    method: 'gps',
    locationDetail: 'Lat: -7.1662, Long: 107.4021',
    district: 'Kec. Rancabali, Kab. Bandung',
    mediaFileName: 'Video_Kawah_Putih_Drone.mp4',
    mediaType: 'video',
    mediaSize: '8.5 MB',
    status: 'published',
  },
  {
    id: 8,
    submitter: '@bot_promo',
    date: '05/10/2026, 19:15 WIB',
    name: 'Vila Ilegal Tanpa Izin',
    category: 'Modern & Lifestyle',
    method: 'maps_link',
    locationDetail: 'https://maps.app.goo.gl/promo_invalid',
    district: 'Wilayah Tidak Teridentifikasi',
    mediaFileName: 'Brosur_Promo_Ilegal.png',
    mediaType: 'photo',
    mediaSize: '1.5 MB',
    status: 'deleted',
    moderationReason: 'Konten promosi terdeteksi melanggar pedoman komunitas dan hak cipta media.',
  },
];

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function AdminMediaModeration() {
  const [contents, setContents] = useState<UserMediaContent[]>(INITIAL_MEDIA_CONTENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Custom Dropdown open states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);

  // Modal Moderation State
  const [inspectingItem, setInspectingItem] = useState<UserMediaContent | null>(null);
  const [editStatus, setEditStatus] = useState<MediaModerationStatus>('published');
  const [moderationReasonInput, setModerationReasonInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{
    id: number;
    prevStatus: MediaModerationStatus;
    name: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsStatusDropdownOpen(false);
        setIsMethodDropdownOpen(false);
        setIsLimitDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Compute KPI metrics dynamically (baseline counts: 50 active, 8 deleted, 58 total)
  const metrics = useMemo(() => {
    const published = 50 + contents.filter((c) => c.status === 'published').length - 6;
    const deleted = 8 + contents.filter((c) => c.status === 'deleted').length - 2;
    const total = published + deleted;
    const videoCount = contents.filter((c) => c.mediaType === 'video').length + 12;
    return { published, deleted, total, videoCount };
  }, [contents]);

  // Filtered & Searched data
  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(query) ||
        item.submitter.toLowerCase().includes(query) ||
        item.mediaFileName.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query);

      const matchStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      const matchMethod =
        selectedMethod === 'all' || item.method === selectedMethod;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [contents, searchQuery, selectedStatus, selectedMethod]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredContents.length / itemsPerPage) || 1;
  const paginatedContents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContents, currentPage, itemsPerPage]);

  const totalItems = filteredContents.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = useMemo(() => {
    return getPageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  // Open Inspection Modal
  const handleOpenInspection = (item: UserMediaContent) => {
    setInspectingItem(item);
    setEditStatus(item.status);
    setModerationReasonInput(item.moderationReason || '');
    setConfirmDeleteId(null);
  };

  // Quick Delete / Restore toggle
  const handleQuickToggleDelete = (id: number) => {
    const target = contents.find((c) => c.id === id);
    if (!target) return;

    const previousStatus = target.status;
    const newStatus: MediaModerationStatus = target.status === 'published' ? 'deleted' : 'published';

    setContents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              moderationReason:
                newStatus === 'deleted'
                  ? 'Konten dinonaktifkan oleh administrator melalui aksi moderasi cepat.'
                  : undefined,
            }
          : c
      )
    );

    setLastAction({ id, prevStatus: previousStatus, name: target.name });
    showToast(
      newStatus === 'deleted'
        ? `Media destinasi "${target.name}" berhasil dihapus dari publikasi.`
        : `Media destinasi "${target.name}" berhasil dipulihkan ke publikasi.`
    );
  };

  // Save Moderation Modal changes
  const handleSaveModeration = () => {
    if (!inspectingItem) return;

    setContents((prev) =>
      prev.map((c) =>
        c.id === inspectingItem.id
          ? {
              ...c,
              status: editStatus,
              moderationReason:
                editStatus === 'deleted' ? moderationReasonInput.trim() : undefined,
            }
          : c
      )
    );

    showToast(`Status moderasi untuk "${inspectingItem.name}" berhasil disimpan.`);
    setInspectingItem(null);
  };

  // Permanent Delete
  const handlePermanentDelete = (id: number) => {
    const target = contents.find((c) => c.id === id);
    if (!target) return;

    setContents((prev) => prev.filter((c) => c.id !== id));
    setInspectingItem(null);
    setConfirmDeleteId(null);
    showToast(`Konten media "${target.name}" berhasil dihapus permanen dari server.`);
  };

  // Undo Last Action
  const handleUndo = () => {
    if (!lastAction) return;

    setContents((prev) =>
      prev.map((c) =>
        c.id === lastAction.id
          ? {
              ...c,
              status: lastAction.prevStatus,
            }
          : c
      )
    );

    showToast(`Aksi moderasi pada "${lastAction.name}" berhasil dibatalkan.`);
    setLastAction(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedMethod('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Apple UI Liquid Glass Toast Notification with Undo */}
      {toastMessage && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100vw-32px)] sm:max-w-lg w-max flex items-center gap-2.5 pl-3.5 pr-3 py-2.5 rounded-full bg-white/85 backdrop-blur-xl saturate-150 border border-white/70 shadow-[0_10px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/[0.04] text-gray-800 text-xs sm:text-[13px] font-semibold animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300"
          role="alert"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          </div>
          <span className="truncate leading-snug">{toastMessage}</span>
          {lastAction && (
            <button
              type="button"
              onClick={handleUndo}
              className="ml-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px] transition-all cursor-pointer shrink-0"
            >
              Urungkan
            </button>
          )}
        </div>
      )}

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
          Moderasi Media & Pengajuan Lokasi Destinasi Baru (User-Generated Content)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Status bawaan pengajuan langsung Published. Admin dapat mengelola status atau menghapus data (Deleted)
        </p>
      </div>

      {/* 4 KPI SUMMARY CARDS (Published, Deleted, Total Pengajuan, Media Journaling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Published (Aktif) */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#60CE9F] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(96,206,159,0.3)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(96,206,159,0.35)]">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Published (Aktif)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.published} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              tampil aktif di peta publik
            </p>
          </div>
        </div>

        {/* Card 2: Deleted (Dihapus) */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(239,68,68,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(239,68,68,0.35)]">
            <Trash2 className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Deleted (Dihapus)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.deleted} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              dinonaktifkan / spam
            </p>
          </div>
        </div>

        {/* Card 3: Total Pengajuan UGC */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(73,65,236,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(73,65,236,0.35)]">
            <FolderArchive className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total Pengajuan</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.total} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              agregasi konten pengguna
            </p>
          </div>
        </div>

        {/* Card 4: Media Journaling & Video */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(59,130,246,0.35)]">
            <Film className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Media Journaling</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.videoCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              lampiran foto & video
            </p>
          </div>
        </div>
      </div>

      {/* SINGLE UNIFIED WHITE CARD CONTAINER: Filters + Table + Pagination */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-7 space-y-5">
        {/* Row 1: Header Title & Total Count (Without Background Fill) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100/80">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              Daftar Pengajuan Tempat Baru
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Moderasi konten media foto, video, dan status penayangan lokasi usulan pengguna
            </p>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-[#4941EC] self-start sm:self-auto">
            Total Pengajuan: {metrics.total}
          </div>
        </div>

        {/* Row 2: Filter Toolbar (Search Bar + Status Dropdown + Metode Dropdown) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input (Rounded-full) */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama tempat atau pengaju..."
                className="w-full pl-10 pr-9 py-2 rounded-full bg-[#F6F7FB] border border-transparent focus:border-gray-200 focus:bg-white text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Bersihkan pencarian"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Status Dropdown (Rounded-full) */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsMethodDropdownOpen(false);
                  setIsLimitDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedStatus !== 'all'
                    ? 'bg-[#EEF2FF] text-[#4941EC] border-[#4941EC]/30'
                    : 'bg-[#F6F7FB] text-gray-700 border-transparent hover:bg-white hover:border-gray-200'
                }`}
              >
                <span className="truncate max-w-[150px]">
                  {selectedStatus === 'all'
                    ? 'Semua Status'
                    : selectedStatus === 'published'
                    ? 'Published (Aktif)'
                    : 'Deleted (Dihapus)'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isStatusDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                  }`}
                />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { value: 'all', label: 'Semua Status' },
                    { value: 'published', label: 'Published (Aktif)' },
                    { value: 'deleted', label: 'Deleted (Dihapus)' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        setSelectedStatus(opt.value);
                        setIsStatusDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        selectedStatus === opt.value
                          ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Method Dropdown (Rounded-full) */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => {
                  setIsMethodDropdownOpen(!isMethodDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsLimitDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedMethod !== 'all'
                    ? 'bg-[#EEF2FF] text-[#4941EC] border-[#4941EC]/30'
                    : 'bg-[#F6F7FB] text-gray-700 border-transparent hover:bg-white hover:border-gray-200'
                }`}
              >
                <span className="truncate max-w-[150px]">
                  {selectedMethod === 'all'
                    ? 'Semua Metode'
                    : selectedMethod === 'gps'
                    ? 'Realtime GPS'
                    : 'Link Google Maps'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isMethodDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                  }`}
                />
              </button>

              {isMethodDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { value: 'all', label: 'Semua Metode' },
                    { value: 'gps', label: 'Realtime GPS' },
                    { value: 'maps_link', label: 'Link Google Maps' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        setSelectedMethod(opt.value);
                        setIsMethodDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        selectedMethod === opt.value
                          ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filter Button (Clean text only, no icon) */}
            {(selectedStatus !== 'all' || selectedMethod !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-gray-400 hover:text-[#4941EC] font-medium transition-colors cursor-pointer px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400 font-medium self-end md:self-auto">
            <span>Sistem Moderasi Otomatis Aktif</span>
          </div>
        </div>

        {/* MODERATION TABLE (CLEAN HEADER WITH NO GRAY FILL AND ZERO CAPSLOCK) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                <th className="py-3 px-5 sm:px-6">Tgl & Pengaju</th>
                <th className="py-3 px-3">Nama Tempat</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Metode & Detail Lokasi</th>
                <th className="py-3 px-3">Status Bawaan</th>
                <th className="py-3 px-5 sm:px-6 text-right">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedContents.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Tgl & Pengaju */}
                  <td className="py-3.5 px-5 sm:px-6 whitespace-nowrap">
                    <p className="text-[11px] text-gray-400 font-medium">
                      {item.date.split(',')[0]}
                    </p>
                    <p className="font-semibold text-[#4941EC] text-xs">
                      {item.submitter}
                    </p>
                  </td>

                  {/* Nama Tempat */}
                  <td className="py-3.5 px-3 font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
                        {item.mediaType === 'video' ? (
                          <Video className="w-3.5 h-3.5" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="truncate max-w-[180px] sm:max-w-[220px]">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        item.category === 'Wisata Alam & Terbuka'
                          ? 'bg-[#EEF2FF] text-[#4941EC]'
                          : item.category === 'Modern & Lifestyle'
                          ? 'bg-[#FEF6E7] text-[#D97706]'
                          : item.category === 'Publik & Edukasi'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#EFF6FF] text-[#2563EB]'
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Metode & Detail Lokasi */}
                  <td className="py-3.5 px-3">
                    <div className="text-xs">
                      <span className="font-medium text-gray-800 flex items-center gap-1.5">
                        {item.method === 'gps' ? (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-[#60CE9F]" />
                            Realtime GPS
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3.5 h-3.5 text-[#4941EC]" />
                            Link Google Maps
                          </>
                        )}
                      </span>
                      <p className="text-[11px] text-gray-400 font-mono truncate max-w-[220px] mt-0.5">
                        {item.locationDetail}
                      </p>
                    </div>
                  </td>

                  {/* Status Bawaan */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {item.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Deleted
                      </span>
                    )}
                  </td>

                  {/* Aksi Moderasi Buttons (NO BUTTON ICONS) */}
                  <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenInspection(item)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-[#EEF0FF] hover:text-[#4941EC] hover:border-[#4941EC]/30 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        Kelola
                      </button>

                      {item.status === 'published' ? (
                        <button
                          type="button"
                          onClick={() => handleQuickToggleDelete(item.id)}
                          className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          Hapus
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickToggleDelete(item.id)}
                          className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          Pulihkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedContents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderArchive className="w-8 h-8 stroke-[1.5] text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">
                        Tidak ada konten media pengajuan yang cocok
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter status/metode.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          {/* Left: Data display count */}
          <div>
            Menampilkan{' '}
            <strong className="text-gray-900 font-semibold">{startItem}</strong> -{' '}
            <strong className="text-gray-900 font-semibold">{endItem}</strong> dari{' '}
            <strong className="text-gray-900 font-semibold">{totalItems}</strong> data
          </div>

          {/* Right: Items per page & page buttons */}
          <div className="flex items-center gap-3">
            {/* Limit Selector */}
            <div className="relative flex items-center gap-1.5" data-dropdown>
              <span className="text-[11px] text-gray-400 hidden sm:inline">Tampilkan:</span>
              <button
                type="button"
                onClick={() => {
                  setIsLimitDropdownOpen(!isLimitDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsMethodDropdownOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
              >
                <span>{itemsPerPage} Data</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isLimitDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-28 bg-white border border-gray-100 shadow-lg rounded-xl p-1 z-30">
                  {[5, 10, 20, 50].map((limit) => (
                    <button
                      type="button"
                      key={limit}
                      onClick={() => {
                        setItemsPerPage(limit);
                        setIsLimitDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                        itemsPerPage === limit
                          ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {limit} per halaman
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prev / Page numbers / Next */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`dots-${index}`} className="px-1 text-gray-400 text-xs">
                        ...
                      </span>
                    );
                  }

                  const pageNum = Number(page);
                  const isCurrent = pageNum === currentPage;

                  return (
                    <button
                      type="button"
                      key={`page-${pageNum}`}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#4941EC] text-white shadow-xs'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                aria-label="Halaman berikutnya"
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: FORM DETAIL & MODERASI MEDIA PENGGUNA */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 tracking-tight">
                  Form Detail & Moderasi Media Pengguna
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tinjau kelayakan media foto/video dan status penayangan di peta publik
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                aria-label="Tutup form"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* 1. Informasi Dasar Usulan & Pengaju */}
              <div className="p-4 rounded-2xl bg-[#FBFBFE] border border-gray-100 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">
                      Nama Tempat Usulan
                    </span>
                    <h4 className="text-base font-semibold text-gray-900">
                      {inspectingItem.name}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      inspectingItem.category === 'Wisata Alam & Terbuka'
                        ? 'bg-[#EEF2FF] text-[#4941EC]'
                        : inspectingItem.category === 'Modern & Lifestyle'
                        ? 'bg-[#FEF6E7] text-[#D97706]'
                        : inspectingItem.category === 'Publik & Edukasi'
                        ? 'bg-[#ECFDF5] text-[#059669]'
                        : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}
                  >
                    {inspectingItem.category}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex flex-wrap items-center justify-between text-xs text-gray-600">
                  <span>
                    Diajukan Oleh:{' '}
                    <strong className="text-gray-900 font-semibold">
                      {inspectingItem.submitter}
                    </strong>
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {inspectingItem.date}
                  </span>
                </div>
              </div>

              {/* 2. Pratinjau Media Lampiran */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                    {inspectingItem.mediaType === 'video' ? (
                      <Video className="w-3.5 h-3.5 text-[#3B82F6]" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-[#4941EC]" />
                    )}
                    Pratinjau Media Lampiran:
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {inspectingItem.mediaFileName} ({inspectingItem.mediaSize})
                  </span>
                </div>

                <div className="w-full h-48 rounded-2xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-500 gap-2 p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-[#4941EC]">
                    {inspectingItem.mediaType === 'video' ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {inspectingItem.mediaFileName}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Ukuran File: {inspectingItem.mediaSize} • Format {inspectingItem.mediaType === 'video' ? 'Video MP4' : 'Foto JPEG'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Data Spasial & Wilayah */}
              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 text-xs space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-700 block">
                  Data Lokasi Spasial:
                </span>
                <p className="text-gray-800 font-mono text-[11px]">
                  {inspectingItem.locationDetail}
                </p>
                <p className="text-[11px] text-gray-500 italic">
                  Wilayah: {inspectingItem.district}
                </p>
              </div>

              {/* 4. Update Status Moderasi */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                  Status Publikasi & Moderasi:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditStatus('published')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      editStatus === 'published'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        editStatus === 'published'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {editStatus === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">Published (Aktif)</span>
                      <span className="text-[10px] text-gray-400">Tampil di Peta Publik & Feed</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('deleted')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      editStatus === 'deleted'
                        ? 'bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        editStatus === 'deleted'
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {editStatus === 'deleted' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">Deleted (Dihapus)</span>
                      <span className="text-[10px] text-gray-400">Disembunyikan dari Publik</span>
                    </div>
                  </button>
                </div>

                {/* Catatan Alasan Moderasi */}
                {editStatus === 'deleted' && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Catatan Moderasi / Alasan Penghapusan:
                    </label>
                    <textarea
                      rows={2}
                      value={moderationReasonInput}
                      onChange={(e) => setModerationReasonInput(e.target.value)}
                      placeholder="Tuliskan alasan penonaktifan konten media atau lokasi..."
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-red-300 focus:bg-white text-xs text-gray-800 outline-none transition-all resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Confirm Delete Section (if triggered) */}
              {confirmDeleteId && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                  <span>Yakin ingin menghapus berkas media ini secara permanen dari server penyimpanan?</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold text-[11px] hover:bg-gray-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentDelete(confirmDeleteId)}
                      className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions (NO BUTTON ICONS) */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#FBFBFE] flex flex-wrap items-center justify-between gap-3">
              {/* Primary Action Button (Left / Prominent) */}
              <button
                type="button"
                onClick={handleSaveModeration}
                className="px-5 py-2 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Simpan Status Moderasi
              </button>

              {/* Secondary Actions (Right) */}
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(inspectingItem.id)}
                  className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hapus Media Permanen
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
