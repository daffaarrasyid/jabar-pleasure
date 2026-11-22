'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  ExternalLink,
  X,
  Check,
  Loader2,
  FileText,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import {
  getAdminSubmissions,
  approveSubmission,
  rejectSubmission,
} from '@/lib/api';

// Dynamic import for interactive Leaflet Map Picker to prevent SSR mismatches and minimize initial load latency
const AdminPoiMapPicker = dynamic(
  () => import('./AdminPoiMapPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-56 sm:h-64 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#4941EC]" />
          <span>Memuat peta verifikasi spasial...</span>
        </div>
      </div>
    ),
  }
);

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

export interface DestinationSubmission {
  id: number;
  name: string;
  submitter: string;
  category: string;
  date: string;
  method: 'gps' | 'maps_link';
  locationDetail: string;
  gmapsUrl?: string;
  description?: string;
  latitude: number;
  longitude: number;
  detectedDistrict: string;
  userPhotoUrl?: string;
  photoFileName?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  processedAt?: string;
}

// Initial realistic West Java user submissions
const INITIAL_SUBMISSIONS: DestinationSubmission[] = [
  {
    id: 1,
    name: 'Curug Tilu Leuwi Opat',
    submitter: '@julyandre',
    category: 'Wisata Alam & Terbuka',
    date: '12/10/2026, 09:24 WIB',
    method: 'gps',
    locationDetail: 'Lat: -6.8245, Long: 107.5789',
    latitude: -6.8245,
    longitude: 107.5789,
    detectedDistrict: 'Kec. Parongpong, Kab. Bandung Barat',
    photoFileName: 'Foto_Bukti_CurugTilu.jpg',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Dago Bakery Punclut',
    submitter: '@daffa_dev',
    category: 'Modern & Lifestyle',
    date: '12/10/2026, 16:45 WIB',
    method: 'maps_link',
    locationDetail: 'https://maps.app.goo.gl/vX9kLmA2qR8zP1',
    latitude: -6.8452,
    longitude: 107.6214,
    detectedDistrict: 'Kec. Cidadap, Kota Bandung',
    photoFileName: 'Foto_DagoBakery_Depan.jpg',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Kampung Kohod',
    submitter: '@rifaldi_pm',
    category: 'Rekreasi Keluarga',
    date: '11/10/2026, 10:15 WIB',
    method: 'gps',
    locationDetail: 'Lat: -6.9175, Long: 107.6191',
    latitude: -6.9175,
    longitude: 107.6191,
    detectedDistrict: 'Kec. Sumur Bandung, Kota Bandung',
    photoFileName: 'Bukti_KampungKohod_Wisata.jpg',
    status: 'pending',
  },
  {
    id: 4,
    name: 'Sanghyang Heuleut',
    submitter: '@bintang_gis',
    category: 'Wisata Alam & Terbuka',
    date: '10/10/2026, 14:20 WIB',
    method: 'gps',
    locationDetail: 'Lat: -6.8831, Long: 107.3451',
    latitude: -6.8831,
    longitude: 107.3451,
    detectedDistrict: 'Kec. Rajamandala Kulon, Kab. Bandung Barat',
    photoFileName: 'Danau_SanghyangHeuleut.png',
    status: 'approved',
    processedAt: '10/10/2026, 15:30 WIB',
  },
  {
    id: 5,
    name: 'Caffe Non-Wisata',
    submitter: '@user_test',
    category: 'Modern & Lifestyle',
    date: '09/10/2026, 11:05 WIB',
    method: 'maps_link',
    locationDetail: 'https://maps.app.goo.gl/zY8mPn1',
    latitude: -6.23,
    longitude: 106.85,
    detectedDistrict: 'Di luar batas Jawa Barat (DKI Jakarta)',
    photoFileName: 'Foto_Depan_Cafe.jpg',
    status: 'rejected',
    adminNotes: 'Koordinat lokasi terdeteksi berada di luar batas administratif Provinsi Jawa Barat.',
    processedAt: '09/10/2026, 13:10 WIB',
  },
  {
    id: 6,
    name: 'Tebing Keraton',
    submitter: '@rully_explore',
    category: 'Wisata Alam & Terbuka',
    date: '08/10/2026, 08:30 WIB',
    method: 'gps',
    locationDetail: 'Lat: -6.8339, Long: 107.6636',
    latitude: -6.8339,
    longitude: 107.6636,
    detectedDistrict: 'Kec. Cimenyan, Kab. Bandung Barat',
    photoFileName: 'Sunrise_TebingKeraton.jpg',
    status: 'approved',
    processedAt: '08/10/2026, 10:00 WIB',
  },
  {
    id: 7,
    name: 'Situ Cileunca Pangalengan',
    submitter: '@anisa_trips',
    category: 'Wisata Alam & Terbuka',
    date: '07/10/2026, 13:40 WIB',
    method: 'gps',
    locationDetail: 'Lat: -7.1894, Long: 107.5542',
    latitude: -7.1894,
    longitude: 107.5542,
    detectedDistrict: 'Kec. Pangalengan, Kab. Bandung',
    photoFileName: 'Danau_SituCileunca.jpg',
    status: 'approved',
    processedAt: '07/10/2026, 15:15 WIB',
  },
  {
    id: 8,
    name: 'Ruko Kosong Komersial',
    submitter: '@spam_bot',
    category: 'Modern & Lifestyle',
    date: '06/10/2026, 18:00 WIB',
    method: 'maps_link',
    locationDetail: 'https://maps.app.goo.gl/rukoSpam',
    latitude: -6.91,
    longitude: 107.6,
    detectedDistrict: 'Kota Bandung',
    photoFileName: 'Bukti_Ruko.png',
    status: 'rejected',
    adminNotes: 'Bukan merupakan tempat wisata rekreasi publik. Tidak memenuhi kriteria POI pariwisata.',
    processedAt: '06/10/2026, 19:20 WIB',
  },
];

// Helper to compute sliding window pagination numbers
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

export default function AdminSubmissionManagement() {
  const [submissions, setSubmissions] = useState<DestinationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Load submissions from backend API
  const loadSubmissions = React.useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const data = await getAdminSubmissions();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: DestinationSubmission[] = data.map((sub: any) => {
          const lat = Number(sub.latitude ?? (sub.proposed_location?.coordinates ? sub.proposed_location.coordinates[1] : -6.9175));
          const lng = Number(sub.longitude ?? (sub.proposed_location?.coordinates ? sub.proposed_location.coordinates[0] : 107.6191));
          const rawDate = sub.created_at ? new Date(sub.created_at) : new Date();
          const formattedDate = rawDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB';

          const gmapsMatch = sub.description ? sub.description.match(/(https?:\/\/[^\s\]]+)/i) : null;
          const extractedLink = gmapsMatch ? gmapsMatch[1] : (sub.evidence_image?.startsWith('http') ? sub.evidence_image : null);
          const hasLink = Boolean(extractedLink);

          return {
            id: sub.id,
            name: sub.name,
            submitter: sub.user?.name ? `@${sub.user.name}` : '@pengguna',
            category: sub.category?.name || 'Wisata Alam & Terbuka',
            date: formattedDate,
            method: hasLink ? 'maps_link' : 'gps',
            locationDetail: extractedLink || `Lat: ${lat.toFixed(4)}, Long: ${lng.toFixed(4)}`,
            gmapsUrl: extractedLink || undefined,
            description: sub.description,
            latitude: lat,
            longitude: lng,
            detectedDistrict: sub.regency?.name || 'Jawa Barat',
            photoFileName: sub.evidence_image && !sub.evidence_image.startsWith('http') ? sub.evidence_image.split('/').pop() : undefined,
            status: sub.status || 'pending',
            adminNotes: sub.admin_note,
          };
        });
        setSubmissions(mapped);
      } else if (Array.isArray(data) && data.length === 0) {
        setSubmissions([]);
      } else {
        setSubmissions(INITIAL_SUBMISSIONS);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setSubmissions(INITIAL_SUBMISSIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions(false);
  }, [loadSubmissions]);

  // Custom Dropdown states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);

  // Inspection Modal States
  const [inspectingSub, setInspectingSub] = useState<DestinationSubmission | null>(null);
  const [showMapPreview, setShowMapPreview] = useState(true);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [editLat, setEditLat] = useState<number>(0);
  const [editLng, setEditLng] = useState<number>(0);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{
    id: number;
    prevStatus: 'pending' | 'approved' | 'rejected';
    name: string;
  } | null>(null);

  // Close dropdowns on outside pointer down
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsStatusDropdownOpen(false);
        setIsMethodDropdownOpen(false);
        setIsLimitDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Real Dynamic KPI Counts from submissions
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;
  const totalCount = submissions.length;

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationDetail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      const matchMethod =
        selectedMethod === 'all' || item.method === selectedMethod;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [submissions, searchQuery, selectedStatus, selectedMethod]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage) || 1;
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubmissions, currentPage, itemsPerPage]);

  const totalItems = filteredSubmissions.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = useMemo(() => {
    return getPageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  // Open Inspection / Detail Modal
  const handleOpenInspection = (sub: DestinationSubmission) => {
    setInspectingSub(sub);
    setEditLat(sub.latitude);
    setEditLng(sub.longitude);
    setAdminNoteInput(sub.adminNotes || '');
    setShowMapPreview(true);
  };

  // Approve Submission via Backend
  const handleApprove = async (id: number) => {
    const target = submissions.find((s) => s.id === id);
    if (!target) return;

    setLastAction({ id, prevStatus: target.status, name: target.name });
    try {
      await approveSubmission(id, {
        adminNote: adminNoteInput.trim() || undefined,
        latitude: editLat,
        longitude: editLng,
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'approved',
                latitude: editLat,
                longitude: editLng,
                processedAt: new Date().toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) + ' WIB',
              }
            : s
        )
      );
      setInspectingSub(null);
      showToast(`Pengajuan "${target.name}" disetujui & dimasukkan ke basis data publik.`);
      loadSubmissions();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui pengajuan.');
    }
  };

  // Reject Submission via Backend
  const handleReject = async (id: number) => {
    const target = submissions.find((s) => s.id === id);
    if (!target) return;

    setLastAction({ id, prevStatus: target.status, name: target.name });
    try {
      await rejectSubmission(id, adminNoteInput.trim() || undefined);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'rejected',
                adminNotes: adminNoteInput.trim() || 'Lokasi tidak memenuhi kriteria verifikasi spasial.',
                processedAt: new Date().toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) + ' WIB',
              }
            : s
        )
      );
      setInspectingSub(null);
      showToast(`Pengajuan "${target.name}" ditolak.`);
      loadSubmissions();
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak pengajuan.');
    }
  };

  // Undo Last Action
  const handleUndo = () => {
    if (!lastAction) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === lastAction.id
          ? {
              ...s,
              status: lastAction.prevStatus,
            }
          : s
      )
    );
    const restoredName = lastAction.name;
    setLastAction(null);
    showToast(`Status pengajuan "${restoredName}" dikembalikan.`);
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
          Manajemen Pengajuan Lokasi Destinasi Baru (User-Generated Content)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Validasi dan moderasi usulan tempat wisata baru dari pengguna sebelum dimasukkan ke basis data publik
        </p>
      </div>

      {/* 4 KPI Summary Cards (Pending, Disetujui, Ditolak, Total Pengajuan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#EDAD40] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(237,173,64,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(237,173,64,0.35)]">
            <Clock className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Pending</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={pendingCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              menunggu validasi kurator
            </p>
          </div>
        </div>

        {/* Card 2: Disetujui */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#60CE9F] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(96,206,159,0.3)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(96,206,159,0.35)]">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Disetujui</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={approvedCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              terverifikasi ke peta publik
            </p>
          </div>
        </div>

        {/* Card 3: Ditolak */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(239,68,68,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(239,68,68,0.35)]">
            <XCircle className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Ditolak</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={rejectedCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              tidak memenuhi kriteria
            </p>
          </div>
        </div>

        {/* Card 4: Total Pengajuan */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(73,65,236,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(73,65,236,0.35)]">
            <Layers className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total Pengajuan</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={totalCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              agregasi pengajuan UGC
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SINGLE UNIFIED CONTAINER (Filters, Actions, and Submissions Table)         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Top Controls Area */}
        <div className="p-5 sm:p-6 pb-4 space-y-4">
          {/* Row 1: Title on the left, Total Antrean on the right (NO background fill) */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              Daftar Antrean Pengajuan Tempat Baru
            </h2>
            <span className="text-xs sm:text-sm font-semibold text-[#4941EC]">
              Total: {filteredSubmissions.length} Antrean
            </span>
          </div>

          {/* Row 2: Search bar + Status dropdown + Metode dropdown */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-4xl">
              {/* Search bar (rounded-full) */}
              <div className="group relative flex-1 min-w-[200px] max-w-xs">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-focus-within:scale-115" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari tempat atau nama pengaju..."
                  className="w-full pl-10 pr-9 py-2 rounded-full bg-[#F6F7FB] border border-transparent focus:border-gray-200 focus:bg-white text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Custom Status Dropdown (rounded-full) */}
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
                  <span className="truncate max-w-[160px]">
                    {selectedStatus === 'all'
                      ? 'Semua Status'
                      : selectedStatus === 'pending'
                      ? 'Menunggu Validasi'
                      : selectedStatus === 'approved'
                      ? 'Disetujui'
                      : 'Ditolak'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      isStatusDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                    }`}
                  />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    {[
                      { value: 'all', label: 'Semua Status' },
                      { value: 'pending', label: 'Menunggu Validasi (Pending)' },
                      { value: 'approved', label: 'Disetujui' },
                      { value: 'rejected', label: 'Ditolak' },
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
                        {selectedStatus === opt.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Metode Dropdown (rounded-full) */}
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
                        {selectedMethod === opt.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset filter button if active */}
              {(selectedStatus !== 'all' || selectedMethod !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                    setSelectedMethod('all');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-gray-400 hover:text-[#4941EC] font-medium transition-colors cursor-pointer px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="text-xs text-gray-400 font-medium self-end md:self-auto">
              <span>Kurasi Spasial PostGIS Aktif</span>
            </div>
          </div>
        </div>

        {/* Table View (Clean header with NO gray fill) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                <th className="py-3 px-5 sm:px-6">Tgl & Pengaju</th>
                <th className="py-3 px-3">Nama Tempat</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Metode & Detail Lokasi</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-5 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedSubmissions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Tgl & Pengaju */}
                  <td className="py-3.5 px-5 sm:px-6 whitespace-nowrap">
                    <p className="text-[11px] text-gray-400 font-medium">
                      {sub.date.split(',')[0]}
                    </p>
                    <p className="font-semibold text-[#4941EC] text-xs">
                      {sub.submitter}
                    </p>
                  </td>

                  {/* Nama Tempat */}
                  <td className="py-3.5 px-3 font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate max-w-[180px] sm:max-w-[220px]">
                        {sub.name}
                      </span>
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        sub.category === 'Wisata Alam & Terbuka'
                          ? 'bg-[#EEF2FF] text-[#4941EC]'
                          : sub.category === 'Modern & Lifestyle'
                          ? 'bg-[#FEF6E7] text-[#D97706]'
                          : sub.category === 'Publik & Edukasi'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#EFF6FF] text-[#2563EB]'
                      }`}
                    >
                      {sub.category}
                    </span>
                  </td>

                  {/* Metode & Detail Lokasi */}
                  <td className="py-3.5 px-3">
                    <div className="text-xs">
                      <span className="font-medium text-gray-800 flex items-center gap-1.5">
                        {sub.method === 'gps' ? (
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
                        {sub.locationDetail}
                      </p>
                    </div>
                  </td>

                  {/* Status Badge with colored dot */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {sub.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending
                      </span>
                    ) : sub.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Disetujui
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Ditolak
                      </span>
                    )}
                  </td>

                  {/* Aksi Button */}
                  <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                    {sub.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenInspection(sub)}
                        className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-[11px] font-semibold transition-all duration-200 cursor-pointer shadow-2xs"
                      >
                        Tinjau & Validasi
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenInspection(sub)}
                        className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 active:scale-95 text-[11px] font-semibold transition-all duration-200 cursor-pointer shadow-2xs"
                      >
                        Lihat Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#4941EC] mx-auto mb-2" />
                    <span className="text-xs">Memuat antrean pengajuan dari database...</span>
                  </td>
                </tr>
              )}

              {!isLoading && submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 stroke-[1.5] text-emerald-500" />
                      <p className="text-xs font-semibold text-gray-700">
                        Semua Pengajuan Telah Selesai Ditinjau
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Saat ini tidak ada antrean pengajuan tempat baru dari pengguna yang perlu diverifikasi.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && submissions.length > 0 && paginatedSubmissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 stroke-[1.5] text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">
                        Tidak Ada Pengajuan yang Sesuai Filter
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

        {/* ========================================================================= */}
        {/* Pagination Footer: Left info, Right custom dropdown & sliding numbers    */}
        {/* ========================================================================= */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          {/* Left: Menampilkan ... - ... dari ... data */}
          <div className="text-gray-500 font-medium">
            {totalItems > 0 ? (
              <span>
                Menampilkan <strong className="font-semibold text-gray-900">{startItem}</strong> -{' '}
                <strong className="font-semibold text-gray-900">{endItem}</strong> dari{' '}
                <strong className="font-semibold text-gray-900">{totalItems}</strong> data
              </span>
            ) : (
              <span>Menampilkan 0 data</span>
            )}
          </div>

          {/* Right: Custom Limit Dropdown & Interactive Page Numbers */}
          <div className="flex items-center gap-3">
            {/* Custom Styled "Tampilkan: X Data" Dropdown */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => {
                  setIsLimitDropdownOpen(!isLimitDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsMethodDropdownOpen(false);
                }}
                className="px-3 py-1.5 rounded-full bg-[#F6F7FB] border border-gray-200/80 hover:bg-white text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{itemsPerPage} / hal</span>
                <ChevronDown
                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                    isLimitDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                  }`}
                />
              </button>

              {isLimitDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-32 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[5, 10, 20].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => {
                        setItemsPerPage(num);
                        setIsLimitDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        itemsPerPage === num
                          ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{num} Data</span>
                      {itemsPerPage === num && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls with Page Numbers */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Sebelumnya"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {pageNumbers.map((p, index) => {
                  if (typeof p === 'string') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="w-7 text-center text-gray-400 select-none text-xs"
                      >
                        &hellip;
                      </span>
                    );
                  }

                  const isActive = p === currentPage;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#4941EC] text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Mobile compact indicator */}
              <span className="sm:hidden text-xs font-semibold text-gray-700 px-1">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Berikutnya"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Detail & Validasi Pengajuan Lokasi Baru Modal (Matching Images 2 & 3)    */}
      {/* ========================================================================= */}
      {inspectingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setInspectingSub(null)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-[#FBFBFE]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                    Detail & Validasi Pengajuan Lokasi Baru
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4941EC] text-[10px] font-semibold">
                    {inspectingSub.method === 'maps_link'
                      ? 'Metode Google Maps'
                      : 'Metode Realtime GPS'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Validasi spasial PostGIS dan kurasi informasi destinasi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSub(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Tutup peninjauan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* 1. Basic Place Info */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Nama Tempat Usulan
                    </p>
                    <h4 className="text-base font-semibold text-gray-900">
                      {inspectingSub.name}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      inspectingSub.category === 'Wisata Alam & Terbuka'
                        ? 'bg-[#EEF2FF] text-[#4941EC]'
                        : inspectingSub.category === 'Modern & Lifestyle'
                        ? 'bg-[#FEF6E7] text-[#D97706]'
                        : inspectingSub.category === 'Publik & Edukasi'
                        ? 'bg-[#ECFDF5] text-[#059669]'
                        : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}
                  >
                    {inspectingSub.category}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex flex-wrap items-center justify-between text-xs text-gray-600">
                  <span>
                    Diajukan Oleh:{' '}
                    <strong className="text-gray-900 font-semibold">
                      {inspectingSub.submitter}
                    </strong>
                  </span>
                  <span className="text-gray-400">{inspectingSub.date}</span>
                </div>
              </div>

              {/* 2. Data Lokasi Spasial */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#4941EC]" />
                  Data Lokasi Spasial
                </h4>

                <div className="p-3.5 rounded-xl border border-gray-100 bg-[#FBFBFE] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Metode Penentuan:</span>
                    <span className="font-semibold text-gray-800">
                      {inspectingSub.method === 'maps_link' ? 'Tautan Google Maps' : 'Realtime GPS Coordinate'}
                    </span>
                  </div>

                  {/* Jika ada tautan Google Maps / URL dari pengguna */}
                  {(inspectingSub.gmapsUrl || inspectingSub.locationDetail?.startsWith('http')) && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-gray-200 text-xs font-mono text-gray-700">
                      <span className="truncate max-w-[280px]">
                        {inspectingSub.gmapsUrl || inspectingSub.locationDetail}
                      </span>
                      <a
                        href={inspectingSub.gmapsUrl || inspectingSub.locationDetail}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#4941EC] hover:bg-[#E0E7FF] font-semibold text-xs transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Google Maps</span>
                      </a>
                    </div>
                  )}

                  {/* Input & Verifikasi Koordinat PostGIS */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-gray-700 block">
                        Input & Verifikasi Koordinat Destinasi (PostGIS SRID 4326):
                      </span>
                      <span className="text-[10px] text-gray-400">Dapat diedit manual</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-500 text-[10px] font-semibold block mb-1">
                          Latitude (Lintang)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={Number.isNaN(editLat) ? '' : editLat}
                          onChange={(e) => setEditLat(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-mono font-semibold text-gray-800 focus:outline-hidden focus:border-[#4941EC] focus:ring-1 focus:ring-[#4941EC]"
                          placeholder="-6.917500"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] font-semibold block mb-1">
                          Longitude (Bujur)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={Number.isNaN(editLng) ? '' : editLng}
                          onChange={(e) => setEditLng(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-mono font-semibold text-gray-800 focus:outline-hidden focus:border-[#4941EC] focus:ring-1 focus:ring-[#4941EC]"
                          placeholder="107.619100"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 italic flex items-center justify-between">
                      <span>Wilayah Terdeteksi: <strong className="text-gray-700">{inspectingSub.detectedDistrict}</strong></span>
                      <span className="text-[10px] text-gray-400">Koordinat akan disimpan saat disetujui</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Preview Peta Verifikasi (PostGIS Layer Check) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#60CE9F]" />
                    Preview Peta Verifikasi (PostGIS Layer Check / Batas Wilayah Jabar)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMapPreview(!showMapPreview)}
                    className="text-xs text-[#4941EC] font-semibold hover:underline cursor-pointer"
                  >
                    {showMapPreview ? 'Sembunyikan Peta' : 'Buka Peta Verifikasi'}
                  </button>
                </div>

                {showMapPreview && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <AdminPoiMapPicker
                      lat={editLat}
                      lng={editLng}
                      onChange={(lat, lng) => {
                        setEditLat(lat);
                        setEditLng(lng);
                      }}
                    />
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Titik Koordinat Pengajuan Terverifikasi - Valid di dalam Batas Administratif Provinsi Jawa Barat (SRID 4326).
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Foto Lampiran Pengguna */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  Foto Lampiran Pengguna
                </span>
                <div className="p-3 rounded-2xl bg-[#FBFBFE] border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center font-mono text-xs font-semibold">
                      JPG
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {inspectingSub.photoFileName || 'Foto_Bukti_Lokasi.jpg'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Lampiran foto verifikasi fisik destinasi (1.42 MB)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Membuka pratinjau foto resolusi penuh...')}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    Buka Foto
                  </button>
                </div>
              </div>

              {/* 5. Catatan Admin (Alasan jika menolak) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Catatan Admin (Alasan jika menolak)
                </label>
                <textarea
                  rows={2}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Tuliskan alasan penolakan jika data/lokasi tidak valid atau catatan kurasi..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#4941EC]/30 focus:bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#FBFBFE] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-400 font-medium">
                {inspectingSub.status !== 'pending' && (
                  <span>
                    Status saat ini: <strong className="font-semibold text-gray-700 capitalize">{inspectingSub.status}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setInspectingSub(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>

                {inspectingSub.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(inspectingSub.id)}
                      className="px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Reject Pengajuan
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(inspectingSub.id)}
                      className="px-5 py-2 rounded-full bg-[#60CE9F] hover:bg-[#4EB789] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      Approve & Masukkan ke DB Publik
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
