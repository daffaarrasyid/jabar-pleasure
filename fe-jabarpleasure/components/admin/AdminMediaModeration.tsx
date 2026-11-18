'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Eye,
  Trash2,
  Film,
  Camera,
  Layers,
  Clock,
  Loader2,
} from 'lucide-react';
import { getAdminMedia, deleteAdminMedia } from '@/lib/api';

/* -------------------------------------------------------------------------- */
/*                                ANIMATED NUMBER                             */
/* -------------------------------------------------------------------------- */
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatDot?: boolean;
}

function AnimatedNumber({
  value,
  duration = 1200,
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

/* -------------------------------------------------------------------------- */
/*                                TYPE DEFINITIONS                            */
/* -------------------------------------------------------------------------- */
export type ModerationStatus = 'pending' | 'sanctioned' | 'approved';
export type SanctionLevel = 0 | 1 | 2 | 3; // 0: Aman / Lolos, 1: Peringatan, 2: Peringatan keras, 3: Ban akun

export interface TripDocumentationMedia {
  id: string; // e.g. "Med-89f2a1"
  type: 'photo' | 'video';
  fileName: string; // e.g. "doc_c89b21a0fe.jpg"
  url: string;
  size: string;
  caption?: string;
  isDeleted: boolean;
}

export interface TripModerationItem {
  id: string; // e.g. "Trip-101"
  tripName: string; // e.g. "Wisata Alam & Kawah Ciwidey"
  userId: string; // e.g. "Usr-204"
  userName: string; // e.g. "Budi Santoso"
  userHandle: string; // e.g. "@budisantoso"
  timestamp: string; // e.g. "16 Nov 2026, 14:20 WIB"
  status: ModerationStatus;
  sanctionLevel?: SanctionLevel;
  sanctionReason?: string;
  mediaList: TripDocumentationMedia[];
}

/* -------------------------------------------------------------------------- */
/*                                INITIAL DEMO DATA                           */
/* -------------------------------------------------------------------------- */
const INITIAL_TRIP_MODERATION: TripModerationItem[] = [
  {
    id: 'Trip-101',
    tripName: 'Wisata Alam & Kawah Ciwidey',
    userId: 'Usr-204',
    userName: 'Budi Santoso',
    userHandle: '@budisantoso',
    timestamp: '16 Nov 2026, 14:20 WIB',
    status: 'pending',
    mediaList: [
      {
        id: 'Med-89a101',
        type: 'photo',
        fileName: 'doc_ciwidey_89a1.jpg',
        url: '/tangkuban-parahu.jpg',
        size: '1.4 MB',
        caption: 'Kabut tipis di tepian kawah',
        isDeleted: false,
      },
      {
        id: 'Med-89a102',
        type: 'photo',
        fileName: 'doc_kawah_89a2.jpg',
        url: '/kawah-ratu.jpg',
        size: '2.1 MB',
        caption: 'Pemandangan lanskap kawah putih',
        isDeleted: false,
      },
      {
        id: 'Med-89a103',
        type: 'video',
        fileName: 'doc_drone_89a3.mp4',
        url: '/videos/timelapse-perjalanan.mp4',
        size: '4.8 MB',
        caption: 'Cuplikan video flyover perjalanan',
        isDeleted: false,
      },
    ],
  },
  {
    id: 'Trip-102',
    tripName: 'Keliling Kuliner & Heritage Bandung',
    userId: 'Usr-312',
    userName: 'July Andre',
    userHandle: '@julyandre',
    timestamp: '15 Nov 2026, 19:45 WIB',
    status: 'pending',
    mediaList: [
      {
        id: 'Med-77b101',
        type: 'photo',
        fileName: 'doc_gedungsate_77b1.jpg',
        url: '/gedung-sate.jpg',
        size: '1.2 MB',
        caption: 'Arsitektur ikonik Gedung Sate',
        isDeleted: false,
      },
      {
        id: 'Med-77b102',
        type: 'photo',
        fileName: 'doc_banner_promo_spam.jpg',
        url: '/botani-square.jpg',
        size: '3.2 MB',
        caption: 'Brosur promo komersial tidak relevan',
        isDeleted: false,
      },
      {
        id: 'Med-77b103',
        type: 'photo',
        fileName: 'doc_kuliner_77b3.jpg',
        url: '/dusun-bambu.jpg',
        size: '1.6 MB',
        caption: 'Suasana santap malam santai',
        isDeleted: false,
      },
    ],
  },
  {
    id: 'Trip-103',
    tripName: 'Liburan Keluarga Floating Market',
    userId: 'Usr-108',
    userName: 'Siti Rahmawati',
    userHandle: '@sitirahma',
    timestamp: '14 Nov 2026, 11:30 WIB',
    status: 'approved',
    sanctionLevel: 0,
    sanctionReason: 'Dokumentasi terverifikasi bersih dan sesuai panduan komunitas.',
    mediaList: [
      {
        id: 'Med-64c201',
        type: 'photo',
        fileName: 'doc_lake_64c1.jpg',
        url: '/floating-market.jpg',
        size: '1.8 MB',
        caption: 'Danau buatan dan perahu wisata',
        isDeleted: false,
      },
      {
        id: 'Med-64c202',
        type: 'photo',
        fileName: 'doc_family_64c2.jpg',
        url: '/friends-crater.jpg',
        size: '2.0 MB',
        caption: 'Foto bersama rombongan keluarga',
        isDeleted: false,
      },
    ],
  },
  {
    id: 'Trip-104',
    tripName: 'Trekking Puncak Sari & Hutan Pinus',
    userId: 'Usr-559',
    userName: 'User Nakal',
    userHandle: '@user_nakal',
    timestamp: '13 Nov 2026, 09:15 WIB',
    status: 'sanctioned',
    sanctionLevel: 2,
    sanctionReason: 'Mengunggah konten tidak pantas pada ruang publik destinasi wisata alam.',
    mediaList: [
      {
        id: 'Med-55d301',
        type: 'photo',
        fileName: 'doc_puncak_55d1.jpg',
        url: '/puncak-sari.jpg',
        size: '1.5 MB',
        caption: 'Jalur pendakian pinus',
        isDeleted: false,
      },
      {
        id: 'Med-55d302',
        type: 'photo',
        fileName: 'doc_violation_sensitive.jpg',
        url: '/dusun-bambu.jpg',
        size: '2.6 MB',
        caption: 'Berkas bermasalah melanggar norma',
        isDeleted: true,
      },
    ],
  },
  {
    id: 'Trip-105',
    tripName: 'Eksplorasi Kebun Raya & Tugu Kujang',
    userId: 'Usr-640',
    userName: 'Ahmad Fauzi',
    userHandle: '@ahmadfauzi',
    timestamp: '12 Nov 2026, 16:10 WIB',
    status: 'pending',
    mediaList: [
      {
        id: 'Med-44e401',
        type: 'photo',
        fileName: 'doc_kujang_44e1.jpg',
        url: '/tugu-kujang.jpg',
        size: '1.6 MB',
        caption: 'Monumen Tugu Kujang sore hari',
        isDeleted: false,
      },
      {
        id: 'Med-44e402',
        type: 'photo',
        fileName: 'doc_kebunraya_44e2.jpg',
        url: '/kebun-raya-bogor.jpg',
        size: '1.9 MB',
        caption: 'Pepohonan rindang Kebun Raya Bogor',
        isDeleted: false,
      },
    ],
  },
  {
    id: 'Trip-106',
    tripName: 'Spam Akun Ilegal Promosi Judi',
    userId: 'Usr-999',
    userName: 'Spammer Bot',
    userHandle: '@bot_promo',
    timestamp: '10 Nov 2026, 02:40 WIB',
    status: 'sanctioned',
    sanctionLevel: 3,
    sanctionReason: 'Penyebaran tautan terlarang dan konten judi online dalam album dokumentasi perjalanan.',
    mediaList: [
      {
        id: 'Med-99f901',
        type: 'photo',
        fileName: 'doc_spam_banner_99f1.jpg',
        url: '/botani-square.jpg',
        size: '2.8 MB',
        caption: 'Tangkapan layar banner judi online terlarang',
        isDeleted: true,
      },
    ],
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

/* -------------------------------------------------------------------------- */
/*                            MAIN ADMIN COMPONENT                            */
/* -------------------------------------------------------------------------- */
export default function AdminMediaModeration() {
  const [tripList, setTripList] = useState<TripModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load real media from backend API
  const loadMedia = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminMedia();
      if (Array.isArray(data) && data.length > 0) {
        const tripsMap: Record<string, TripModerationItem> = {};
        data.forEach((m: any, index: number) => {
          const tripKey = m.check_in_id ? `Trip-${m.check_in_id}` : `Trip-${m.id}`;
          const tripName = m.check_in?.destination?.name
            ? `Dokumentasi di ${m.check_in.destination.name}`
            : (m.caption || 'Dokumentasi Perjalanan Wisata');
          const user = m.check_in?.user;
          const userName = user?.name || 'Pengguna Komunitas';
          const userHandle = `@${(user?.name || 'pengguna').toLowerCase().replace(/\s+/g, '_')}`;
          const rawDate = m.created_at ? new Date(m.created_at) : new Date();
          const timestamp = rawDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB';

          if (!tripsMap[tripKey]) {
            tripsMap[tripKey] = {
              id: tripKey,
              tripName,
              userId: `Usr-${user?.id || index + 1}`,
              userName,
              userHandle,
              timestamp,
              status: 'pending',
              mediaList: [],
            };
          }

          tripsMap[tripKey].mediaList.push({
            id: String(m.id),
            type: m.media_type === 'video' ? 'video' : 'photo',
            fileName: m.file_path ? m.file_path.split('/').pop() : `media_${m.id}.jpg`,
            url: m.url || m.file_path || '/tangkuban-parahu.jpg',
            size: m.file_size_kb ? `${(m.file_size_kb / 1024).toFixed(1)} MB` : '1.2 MB',
            caption: m.caption,
            isDeleted: false,
          });
        });

        const tripArray = Object.values(tripsMap);
        if (tripArray.length > 0) {
          setTripList(tripArray);
        } else {
          setTripList(INITIAL_TRIP_MODERATION);
        }
      } else {
        setTripList(INITIAL_TRIP_MODERATION);
      }
    } catch (err) {
      console.error('Failed to load admin media:', err);
      setTripList(INITIAL_TRIP_MODERATION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // 2. Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dropdown open states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);

  // 3. Inspection Modal State
  const [inspectingTrip, setInspectingTrip] = useState<TripModerationItem | null>(null);
  const [stagedMediaList, setStagedMediaList] = useState<TripDocumentationMedia[]>([]);
  const [selectedSanctionLevel, setSelectedSanctionLevel] = useState<SanctionLevel>(0);
  const [sanctionReasonInput, setSanctionReasonInput] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // 4. Media Lightbox Preview State
  const [previewMedia, setPreviewMedia] = useState<TripDocumentationMedia | null>(null);

  // 5. Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save to localStorage whenever tripList updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jp_admin_trip_moderation', JSON.stringify(tripList));
      } catch {
        // ignore
      }
    }
  }, [tripList]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsStatusDropdownOpen(false);
        setIsLimitDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                             METRIC AGGREGATION                             */
  /* -------------------------------------------------------------------------- */
  const metrics = useMemo(() => {
    const totalTrips = tripList.length;
    const pendingCount = tripList.filter((t) => t.status === 'pending').length;
    const sanctionedCount = tripList.filter((t) => t.status === 'sanctioned').length;
    const deletedMediaCount = tripList.reduce(
      (acc, trip) => acc + trip.mediaList.filter((m) => m.isDeleted).length,
      0
    );

    return {
      totalTrips,
      pendingCount,
      sanctionedCount,
      deletedMediaCount,
    };
  }, [tripList]);

  /* -------------------------------------------------------------------------- */
  /*                             FILTER & PAGINATION                            */
  /* -------------------------------------------------------------------------- */
  const filteredTrips = useMemo(() => {
    return tripList.filter((item) => {
      // 1. Search filter: Id perjalanan, nama perjalanan, Id pengguna, nama pengguna
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = item.id.toLowerCase().includes(query);
        const matchTitle = item.tripName.toLowerCase().includes(query);
        const matchUserId = item.userId.toLowerCase().includes(query);
        const matchUserName = item.userName.toLowerCase().includes(query);
        const matchUserHandle = item.userHandle.toLowerCase().includes(query);

        if (!matchId && !matchTitle && !matchUserId && !matchUserName && !matchUserHandle) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [tripList, searchQuery, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / itemsPerPage));

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTrips.slice(start, start + itemsPerPage);
  }, [filteredTrips, currentPage, itemsPerPage]);

  const startItem = filteredTrips.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredTrips.length);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  /* -------------------------------------------------------------------------- */
  /*                          INSPECTION MODAL HANDLERS                         */
  /* -------------------------------------------------------------------------- */
  const handleOpenInspection = (trip: TripModerationItem) => {
    setInspectingTrip(trip);
    setStagedMediaList(trip.mediaList.map((m) => ({ ...m })));
    setSelectedSanctionLevel(trip.sanctionLevel ?? 0);
    setSanctionReasonInput(trip.sanctionReason ?? '');
    setFormError(null);
  };

  const handleCloseInspection = () => {
    setInspectingTrip(null);
    setStagedMediaList([]);
    setFormError(null);
  };

  const handleToggleStagedMediaDelete = (mediaId: string) => {
    setStagedMediaList((prev) =>
      prev.map((m) => (m.id === mediaId ? { ...m, isDeleted: !m.isDeleted } : m))
    );
  };

  const handleSubmitModeration = () => {
    if (!inspectingTrip) return;

    // Validate: if sanction level is > 0, reason must be provided
    if (selectedSanctionLevel > 0 && !sanctionReasonInput.trim()) {
      setFormError('Alasan pelanggaran wajib diisi jika menetapkan sanksi.');
      return;
    }

    const newStatus: ModerationStatus =
      selectedSanctionLevel > 0 ? 'sanctioned' : 'approved';

    setTripList((prev) =>
      prev.map((t) => {
        if (t.id === inspectingTrip.id) {
          return {
            ...t,
            status: newStatus,
            sanctionLevel: selectedSanctionLevel,
            sanctionReason: sanctionReasonInput.trim() || undefined,
            mediaList: stagedMediaList,
          };
        }
        return t;
      })
    );

    showToast(
      selectedSanctionLevel > 0
        ? `Tindakan sanksi tingkat ${selectedSanctionLevel} berhasil diterapkan untuk ${inspectingTrip.id}.`
        : `Moderasi perjalanan ${inspectingTrip.id} berhasil disetujui (bersih).`
    );

    handleCloseInspection();
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B0F19]/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-white/20 flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#60CE9F] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. METRICS CARDS: 4 CLEAN METRICS (MATCHING POI & OVERVIEW STYLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Perjalanan */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(73,65,236,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total Perjalanan</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.totalTrips} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              antrean moderasi media
            </p>
          </div>
        </div>

        {/* Card 2: Menunggu Verifikasi */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#EDAD40] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(237,173,64,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Menunggu Tinjauan</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.pendingCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              perlu audit dokumentasi
            </p>
          </div>
        </div>

        {/* Card 3: Sanksi Diberikan */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(225,29,72,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Sanksi Pengguna</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.sanctionedCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              pelanggaran ditindak
            </p>
          </div>
        </div>

        {/* Card 4: Media Dihapus */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#64748B] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(100,116,139,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
            <Trash2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Media Dihapus</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.deletedMediaCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              berkas tak pantas ditakedown
            </p>
          </div>
        </div>
      </div>

      {/* 2. UNIFIED WHITE CONTAINER: FILTERS + TABLE + PAGINATION */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-7 space-y-5">
        {/* Row 1: Header Title & Total Count (Clean text, no uppercase) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100/80">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              Moderasi Media Dokumentasi Perjalanan
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Pemeriksaan konten media foto dan video dokumentasi perjalanan wisata yang diunggah pengguna
            </p>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-[#4941EC] self-start sm:self-auto">
            Total Perjalanan: {filteredTrips.length}
          </div>
        </div>

        {/* Row 2: Filter Toolbar (Search Bar + Status Dropdown + Reset Button) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input (Rounded-full, matching POI management) */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Id perjalanan, nama perjalanan, atau pengguna..."
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
                    ? 'Semua status'
                    : selectedStatus === 'pending'
                    ? 'Menunggu tinjauan'
                    : selectedStatus === 'sanctioned'
                    ? 'Telah disanksi'
                    : 'Disetujui (bersih)'}
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
                    { value: 'all', label: 'Semua status' },
                    { value: 'pending', label: 'Menunggu tinjauan' },
                    { value: 'sanctioned', label: 'Telah disanksi' },
                    { value: 'approved', label: 'Disetujui (bersih)' },
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
                      {selectedStatus === opt.value && <Check className="w-3.5 h-3.5 text-[#4941EC]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filter Button */}
            {(selectedStatus !== 'all' || searchQuery) && (
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
            <span>Sistem moderasi konten terintegrasi</span>
          </div>
        </div>

        {/* Table View: Id perjalanan | Nama perjalanan | Id pengguna | Time stamp | Status | Aksi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                <th className="py-3 px-5 sm:px-6">Id perjalanan</th>
                <th className="py-3 px-3">Nama perjalanan</th>
                <th className="py-3 px-3">Id pengguna</th>
                <th className="py-3 px-3">Time stamp</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-5 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedTrips.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Id perjalanan */}
                  <td className="py-3.5 px-5 sm:px-6 font-semibold text-gray-900 whitespace-nowrap">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#EEF2FF] text-[#4941EC] font-semibold border border-[#4941EC]/15">
                      {item.id}
                    </span>
                  </td>

                  {/* Nama perjalanan + Media count badge */}
                  <td className="py-3.5 px-3 font-semibold text-gray-900">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        {item.tripName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal flex items-center gap-1.5 mt-0.5">
                        <Camera className="w-3 h-3 text-gray-400" />
                        <span>{item.mediaList.length} berkas media dokumentasi</span>
                      </span>
                    </div>
                  </td>

                  {/* Id pengguna + Nama */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] text-[#4941EC] font-semibold">
                        {item.userId}
                      </span>
                      <span className="text-[11px] text-gray-700 font-medium">
                        {item.userName}{' '}
                        <span className="text-gray-400 font-normal">({item.userHandle})</span>
                      </span>
                    </div>
                  </td>

                  {/* Time stamp */}
                  <td className="py-3.5 px-3 text-gray-600 font-medium whitespace-nowrap">
                    {item.timestamp}
                  </td>

                  {/* Status Badge with Dot */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {item.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Menunggu tinjauan
                      </span>
                    ) : item.status === 'sanctioned' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Telah disanksi (tingkat {item.sanctionLevel})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Disetujui (bersih)
                      </span>
                    )}
                  </td>

                  {/* Aksi Button (Matching POI table button: rounded-full pill) */}
                  <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenInspection(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-[#EEF0FF] hover:text-[#4941EC] hover:border-[#4941EC]/30 text-[11px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Periksa media</span>
                    </button>
                  </td>
                </tr>
              ))}

              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#4941EC] mx-auto mb-2" />
                    <span className="text-xs">Memuat berkas media dokumentasi dari database...</span>
                  </td>
                </tr>
              )}

              {!isLoading && tripList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 stroke-[1.5] text-emerald-500" />
                      <p className="text-xs font-semibold text-gray-700">
                        Tidak Ada Media yang Perlu Dimoderasi
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Seluruh berkas dokumentasi perjalanan pengguna telah bersih dan sesuai pedoman komunitas.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && tripList.length > 0 && paginatedTrips.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 stroke-[1.5] text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">
                        Tidak Ada Perjalanan yang Sesuai Filter
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter status moderasi.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer: Left info, Right custom limit dropdown & sliding numbers */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          {/* Left: Menampilkan ... - ... dari ... data */}
          <div className="text-gray-500 font-medium">
            {filteredTrips.length > 0 ? (
              <span>
                Menampilkan <strong className="font-semibold text-gray-900">{startItem}</strong> -{' '}
                <strong className="font-semibold text-gray-900">{endItem}</strong> dari{' '}
                <strong className="font-semibold text-gray-900">{filteredTrips.length}</strong> data perjalanan
              </span>
            ) : (
              <span>Menampilkan 0 data perjalanan</span>
            )}
          </div>

          {/* Right: Custom Limit Dropdown & Sliding Page Numbers */}
          <div className="flex items-center gap-3">
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => {
                  setIsLimitDropdownOpen(!isLimitDropdownOpen);
                  setIsStatusDropdownOpen(false);
                }}
                className="px-3 py-1.5 rounded-full bg-[#F6F7FB] border border-gray-200/80 hover:bg-white text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{itemsPerPage} / hal</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isLimitDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                  }`}
                />
              </button>

              {isLimitDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1.5 w-32 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[5, 10, 20].map((lim) => (
                    <button
                      type="button"
                      key={lim}
                      onClick={() => {
                        setItemsPerPage(lim);
                        setIsLimitDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        itemsPerPage === lim
                          ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lim} / hal</span>
                      {itemsPerPage === lim && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
                className="w-8 h-8 rounded-full border border-gray-200/80 hover:bg-[#EEF0FF] hover:text-[#4941EC] hover:border-[#4941EC]/30 flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers(currentPage, totalPages).map((pageNum, idx) =>
                typeof pageNum === 'number' ? (
                  <button
                    type="button"
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#4941EC] text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : (
                  <span
                    key={`dots-${idx}`}
                    className="w-7 text-center text-gray-400 font-semibold"
                  >
                    ...
                  </span>
                )
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Halaman berikutnya"
                className="w-8 h-8 rounded-full border border-gray-200/80 hover:bg-[#EEF0FF] hover:text-[#4941EC] hover:border-[#4941EC]/30 flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INSPECTION MODAL (SYSTEM ANALYST DESIGN SPECIFICATION) */}
      {inspectingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={handleCloseInspection}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-white shrink-0">
              <div>
                <span className="text-[10px] font-semibold text-[#4941EC] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#4941EC]/15">
                  Inspeksi moderasi konten
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                  Detail moderasi media perjalanan
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseInspection}
                aria-label="Tutup inspeksi"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body: Clean, Flat Structure (No excessive nesting) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* ----------------------------------------------------------------- */}
              {/* A. CARD OVERVIEW: Id perjalanan, nama perjalanan, Id pengguna     */}
              {/* ----------------------------------------------------------------- */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Id perjalanan */}
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block">
                      Id perjalanan
                    </span>
                    <span className="font-mono text-xs font-bold text-[#4941EC] bg-white px-2 py-0.5 rounded border border-gray-200/60 inline-block mt-0.5">
                      {inspectingTrip.id}
                    </span>
                  </div>

                  {/* Nama perjalanan */}
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block">
                      Nama perjalanan
                    </span>
                    <span className="text-xs font-bold text-gray-900 block truncate mt-0.5" title={inspectingTrip.tripName}>
                      {inspectingTrip.tripName}
                    </span>
                  </div>

                  {/* Id pengguna & Nama */}
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block">
                      Pengguna pengunggah
                    </span>
                    <div className="text-xs text-gray-900 font-semibold truncate mt-0.5">
                      <span className="font-mono text-[#4941EC] mr-1.5">{inspectingTrip.userId}</span>
                      <span>{inspectingTrip.userName}</span>
                    </div>
                  </div>

                  {/* Time stamp */}
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block">
                      Time stamp
                    </span>
                    <span className="text-xs font-semibold text-gray-700 block mt-0.5">
                      {inspectingTrip.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* B. TABLE MEDIA: Id media | Jenis media | Nama media | Lihat + aksi*/}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900">
                    Daftar media dokumentasi ({stagedMediaList.length} berkas)
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {stagedMediaList.filter((m) => m.isDeleted).length} media ditandai hapus
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-[#F8FAFC] text-gray-700 font-semibold">
                        <th className="py-2.5 px-4">Id media</th>
                        <th className="py-2.5 px-3">Jenis media</th>
                        <th className="py-2.5 px-3">Nama media</th>
                        <th className="py-2.5 px-4 text-right">Lihat & aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {stagedMediaList.map((media) => (
                        <tr
                          key={media.id}
                          className={`transition-colors ${
                            media.isDeleted ? 'bg-red-50/40 text-gray-400' : 'hover:bg-gray-50/60'
                          }`}
                        >
                          {/* Id media */}
                          <td className="py-3 px-4 font-mono text-[11px] font-semibold whitespace-nowrap">
                            <span
                              className={
                                media.isDeleted
                                  ? 'line-through text-gray-400'
                                  : 'text-gray-800'
                              }
                            >
                              {media.id}
                            </span>
                          </td>

                          {/* Jenis media (badge Foto / Video) */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {media.type === 'video' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                                <Film className="w-3 h-3 text-[#2563EB]" />
                                <span>Video</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#4941EC] border border-[#4941EC]/20">
                                <Camera className="w-3 h-3 text-[#4941EC]" />
                                <span>Foto</span>
                              </span>
                            )}
                          </td>

                          {/* Nama media (abstrak teks / hash file) */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {/* Micro thumbnail */}
                              <div
                                onClick={() => setPreviewMedia(media)}
                                className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200/80 cursor-pointer hover:opacity-80 transition-opacity"
                                title="Klik untuk pratinjau"
                              >
                                {media.type === 'video' ? (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                                    <Film className="w-3.5 h-3.5 text-[#60CE9F]" />
                                  </div>
                                ) : (
                                  <Image
                                    src={media.url}
                                    alt={media.fileName}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <span
                                  className={`font-mono text-xs block truncate max-w-[200px] sm:max-w-xs ${
                                    media.isDeleted
                                      ? 'line-through text-gray-400'
                                      : 'font-semibold text-gray-800'
                                  }`}
                                  title={media.fileName}
                                >
                                  {media.fileName}
                                </span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  {media.size}
                                  {media.caption && (
                                    <> &bull; &ldquo;{media.caption}&rdquo;</>
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Lihat + Aksi (Hapus Media) */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Lihat Button */}
                              <button
                                type="button"
                                onClick={() => setPreviewMedia(media)}
                                className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-[#EEF0FF] hover:text-[#4941EC] hover:border-[#4941EC]/30 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                              >
                                Lihat
                              </button>

                              {/* Hapus Media Toggle Button */}
                              {media.isDeleted ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStagedMediaDelete(media.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                                >
                                  Batal hapus
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStagedMediaDelete(media.id)}
                                  className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                                >
                                  Hapus media
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* C. CARD SANKSI: Tingkat pelanggaran (3 tingkatan) + Alasan + Submit*/}
              {/* ----------------------------------------------------------------- */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    Penetapan tindakan & sanksi pelanggaran
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Pilih tingkat penindakan sesuai keparahan pelanggaran konten media pada perjalanan ini
                  </p>
                </div>

                {/* 3 Tingkatan Pelanggaran (+ 1 Opsi Aman) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-700 block">
                    Tingkat pelanggaran:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* Opsi 0: Aman / Lolos */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSanctionLevel(0);
                        setFormError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        selectedSanctionLevel === 0
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          selectedSanctionLevel === 0
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedSanctionLevel === 0 && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-tight">
                          Aman / Lolos
                        </span>
                        <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                          Tidak ada pelanggaran
                        </span>
                      </div>
                    </button>

                    {/* Opsi 1: Peringatan */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSanctionLevel(1);
                        setFormError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        selectedSanctionLevel === 1
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          selectedSanctionLevel === 1
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedSanctionLevel === 1 && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-tight">
                          1 - Peringatan
                        </span>
                        <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                          Pelanggaran ringan / spam
                        </span>
                      </div>
                    </button>

                    {/* Opsi 2: Peringatan keras */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSanctionLevel(2);
                        setFormError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        selectedSanctionLevel === 2
                          ? 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          selectedSanctionLevel === 2
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedSanctionLevel === 2 && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-tight">
                          2 - Peringatan keras
                        </span>
                        <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                          Pelanggaran berulang / kasar
                        </span>
                      </div>
                    </button>

                    {/* Opsi 3: Ban akun */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSanctionLevel(3);
                        setFormError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        selectedSanctionLevel === 3
                          ? 'bg-red-50 border-red-600 text-red-950 ring-1 ring-red-600'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          selectedSanctionLevel === 3
                            ? 'border-red-600 bg-red-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedSanctionLevel === 3 && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-tight">
                          3 - Ban akun
                        </span>
                        <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                          Pemblokiran akses permanen
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Alasan Pelanggaran */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-700 block">
                    Alasan pelanggaran:
                  </label>
                  <textarea
                    rows={3}
                    value={sanctionReasonInput}
                    onChange={(e) => {
                      setSanctionReasonInput(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder={
                      selectedSanctionLevel === 0
                        ? 'Catatan verifikasi (opsional)...'
                        : 'Jelaskan alasan penetapan sanksi (misal: foto mengandung materi tidak senonoh / spam promosi)...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#4941EC] focus:ring-1 focus:ring-[#4941EC] text-xs text-gray-800 placeholder:text-gray-400 outline-none transition-all resize-none"
                  />
                  {formError && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formError}</span>
                    </p>
                  )}
                </div>

                {/* Submit Action Row */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-gray-200/60">
                  <button
                    type="button"
                    onClick={handleCloseInspection}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitModeration}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-xs font-semibold shadow-[0_2px_10px_rgba(73,65,236,0.22)] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Submit tindakan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. LIGHTBOX PREVIEW MODAL (FOTO / VIDEO PLAYER) */}
      {previewMedia && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div
            className="absolute inset-0"
            onClick={() => setPreviewMedia(null)}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl w-full bg-[#0B0F19] rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 bg-black/50 border-b border-white/10 text-white">
              <div className="min-w-0 pr-2">
                <span className="font-mono text-xs font-bold text-[#60CE9F] block truncate">
                  {previewMedia.fileName}
                </span>
                <span className="text-[10px] text-white/60 block">
                  Format: {previewMedia.type === 'video' ? 'Video MP4' : 'Foto JPEG/PNG'} &bull; Ukuran: {previewMedia.size}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                aria-label="Tutup pratinjau"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Viewport */}
            <div className="relative w-full h-[360px] sm:h-[480px] bg-black flex items-center justify-center">
              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Image
                  src={previewMedia.url}
                  alt={previewMedia.fileName}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              )}
            </div>

            {/* Caption Footer */}
            {previewMedia.caption && (
              <div className="p-3 bg-black/70 border-t border-white/10 text-center text-xs text-white/90">
                &ldquo;{previewMedia.caption}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
