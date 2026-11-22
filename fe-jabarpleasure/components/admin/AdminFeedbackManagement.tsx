'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Mail,
  User,
  Calendar,
  Sparkles,
  Paperclip,
  Star,
  Loader2,
} from 'lucide-react';
import {
  getAdminFeedback,
  replyAdminFeedback,
  updateAdminFeedbackStatus,
  deleteAdminFeedback,
} from '@/lib/api';
import {
  UserFeedback,
  FeedbackCategory,
  FeedbackStatus,
} from '@/lib/feedbackStorage';

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

export type { FeedbackCategory, FeedbackStatus, UserFeedback };

const CATEGORY_CONFIG: Record<
  FeedbackCategory,
  { label: string; badgeClass: string }
> = {
  bug: {
    label: 'Laporan Bug / Error',
    badgeClass: 'bg-[#FEF2F2] text-[#DC2626]',
  },
  feature: {
    label: 'Usulan Fitur Baru',
    badgeClass: 'bg-[#EEF2FF] text-[#4941EC]',
  },
  question: {
    label: 'Pertanyaan Umum',
    badgeClass: 'bg-[#EFF6FF] text-[#2563EB]',
  },
  other: {
    label: 'Ulasan & Masukan',
    badgeClass: 'bg-emerald-50 text-emerald-700',
  },
};

const STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string }
> = {
  unread: {
    label: 'Belum Dibaca',
  },
  in_progress: {
    label: 'Dalam Proses',
  },
  resolved: {
    label: 'Selesai',
  },
};

// Quick response templates for admin productivity
const QUICK_TEMPLATES = [
  'Terima kasih atas laporannya! Tim developer sedang menginvestigasi kendala ini.',
  'Usulan fitur ini sangat baik dan telah dicatat dalam backlog pengembangan sistem berikutnya.',
  'Terima kasih! Kami telah menindaklanjuti masukan Anda dan melakukan pembaruan pada data terkait.',
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

export default function AdminFeedbackManagement() {
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Purge any legacy initial dummy feedbacks from localStorage on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('jp_user_feedback_list');
        if (raw && (raw.includes('@julyandre') || raw.includes('Lembang') || raw.includes('@daffa_dev'))) {
          localStorage.removeItem('jp_user_feedback_list');
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Load feedback purely from backend database API
  const loadFeedback = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminFeedback();
      if (Array.isArray(data)) {
        const mapped: UserFeedback[] = data.map((f: any) => {
          let cat: FeedbackCategory = 'other';
          const c = (f.category || '').toLowerCase();
          if (c.includes('bug') || c.includes('error')) cat = 'bug';
          else if (c.includes('fitur') || c.includes('usulan')) cat = 'feature';
          else if (c.includes('tanya') || c.includes('informasi')) cat = 'question';

          let st: FeedbackStatus = 'unread';
          if (f.status === 'in_progress' || f.status === 'Ditanggapi') st = 'in_progress';
          else if (f.status === 'resolved' || f.status === 'Selesai') st = 'resolved';

          const rawDate = f.created_at ? new Date(f.created_at) : new Date();
          const formattedDate = rawDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB';

          let formattedRepliedDate: string | undefined = undefined;
          if (f.replied_at) {
            formattedRepliedDate = new Date(f.replied_at).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) + ' WIB';
          }

          return {
            id: f.id,
            submitterName: f.user_name || '@pengguna',
            submitterEmail: f.user_email || 'pengguna@jabarpleasure.id',
            category: cat,
            date: formattedDate,
            message: f.message || f.subject,
            status: st,
            tripTitle: f.subject,
            rating: f.rating,
            attachmentUrl: f.attachment_url,
            attachmentName: f.attachment_url ? f.attachment_url.split('/').pop() : undefined,
            adminReply: f.admin_reply,
            repliedAt: formattedRepliedDate,
          };
        });

        setFeedbackList(mapped);
      } else {
        setFeedbackList([]);
      }
    } catch (err) {
      console.error('Failed to load admin feedback:', err);
      setFeedbackList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Sync feedbackList from shared localStorage
  useEffect(() => {
    const handleSync = () => {
      loadFeedback();
    };

    window.addEventListener('jabarpleasure_feedback_updated', handleSync);
    return () => {
      window.removeEventListener('jabarpleasure_feedback_updated', handleSync);
    };
  }, [loadFeedback]);

  // Custom Dropdown open states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);

  // Modal Detail State
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [editStatus, setEditStatus] = useState<FeedbackStatus>('unread');
  const [replyMessage, setReplyMessage] = useState('');
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{
    type: 'update' | 'delete';
    item: UserFeedback;
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
        setIsCategoryDropdownOpen(false);
        setIsStatusDropdownOpen(false);
        setIsLimitDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Compute KPI metrics dynamically
  const metrics = useMemo(() => {
    const unread = feedbackList.filter((f) => f.status === 'unread').length;
    const inProgress = feedbackList.filter((f) => f.status === 'in_progress').length;
    const resolved = feedbackList.filter((f) => f.status === 'resolved').length;
    const total = feedbackList.length;
    return { unread, inProgress, resolved, total };
  }, [feedbackList]);

  // Filtered & Searched data
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        item.submitterName.toLowerCase().includes(query) ||
        item.submitterEmail.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        CATEGORY_CONFIG[item.category].label.toLowerCase().includes(query);

      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [feedbackList, searchQuery, selectedCategory, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage) || 1;
  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFeedback.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFeedback, currentPage, itemsPerPage]);

  const totalItems = filteredFeedback.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = useMemo(() => {
    return getPageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  // Open modal
  const handleOpenDetail = (item: UserFeedback) => {
    setSelectedFeedback(item);
    setEditStatus(item.status);
    setReplyMessage(item.adminReply || '');
    setShowAttachmentPreview(false);
    setConfirmDeleteId(null);
  };

  // Submit response & update status
  const handleSaveResponse = async () => {
    if (!selectedFeedback) return;

    const previousItem = { ...selectedFeedback };
    const nowStr =
      new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

    const updatedItem: UserFeedback = {
      ...selectedFeedback,
      status: editStatus,
      adminReply: replyMessage.trim() || undefined,
      repliedAt: replyMessage.trim() ? nowStr : selectedFeedback.repliedAt,
    };

    try {
      if (replyMessage.trim()) {
        await replyAdminFeedback(selectedFeedback.id, replyMessage.trim(), editStatus);
      } else {
        await updateAdminFeedbackStatus(selectedFeedback.id, editStatus);
      }
    } catch (err) {
      console.warn('Backend feedback response sync failed, updating local state:', err);
    }

    setFeedbackList((prev) =>
      prev.map((f) => (f.id === selectedFeedback.id ? updatedItem : f))
    );
    setLastAction({ type: 'update', item: previousItem });
    setSelectedFeedback(null);
    showToast(`Tanggapan & status saran dari ${updatedItem.submitterName} berhasil disimpan.`);
  };

  // Delete feedback item
  const handleDeleteFeedback = async (id: number) => {
    const target = feedbackList.find((f) => f.id === id);
    if (!target) return;

    try {
      await deleteAdminFeedback(id);
    } catch (err) {
      console.warn('Backend feedback delete sync failed, deleting from local state:', err);
    }

    setLastAction({ type: 'delete', item: target });
    setFeedbackList((prev) => prev.filter((f) => f.id !== id));
    setSelectedFeedback(null);
    setConfirmDeleteId(null);
    showToast(`Pesan masukan dari ${target.submitterName} telah dihapus.`);
  };

  // Undo Last Action
  const handleUndo = () => {
    if (!lastAction) return;

    if (lastAction.type === 'delete') {
      setFeedbackList((prev) => [lastAction.item, ...prev]);
      showToast(`Pesan masukan dari ${lastAction.item.submitterName} berhasil dikembalikan.`);
    } else if (lastAction.type === 'update') {
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === lastAction.item.id ? lastAction.item : f))
      );
      showToast(`Perubahan status pesan dari ${lastAction.item.submitterName} dibatalkan.`);
    }
    setLastAction(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
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
          Manajemen Saran & Masukan Pengguna
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Kelola ulasan, laporan kendala sistem, dan usulan fitur dari pengguna aplikasi JabarPleasure
        </p>
      </div>

      {/* 4 KPI Summary Cards (Belum Dibaca, Dalam Proses, Selesai, Total Masukan) - EXACT HARMONY WITH OVERVIEW & PENGAJUAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Belum Dibaca */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#EDAD40] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(237,173,64,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(237,173,64,0.35)]">
            <Mail className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Belum Dibaca</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.unread} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              pesan baru masuk
            </p>
          </div>
        </div>

        {/* Card 2: Dalam Proses */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(59,130,246,0.35)]">
            <Clock className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Dalam Proses</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.inProgress} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              sedang ditindaklanjuti
            </p>
          </div>
        </div>

        {/* Card 3: Selesai */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#60CE9F] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(96,206,159,0.3)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(96,206,159,0.35)]">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Selesai</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.resolved} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              laporan terselesaikan
            </p>
          </div>
        </div>

        {/* Card 4: Total Masukan */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(73,65,236,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(73,65,236,0.35)]">
            <MessageSquare className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total Masukan</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.total} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              total seluruh pesan
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
              Daftar Pesan Masukan Pengguna
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Kelola laporan kendala, pertanyaan teknis, dan aspirasi pengguna
            </p>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-[#4941EC] self-start sm:self-auto">
            Total Masukan: {metrics.total}
          </div>
        </div>

        {/* Row 2: Filter Toolbar (Search Bar + Category Dropdown + Status Dropdown) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input (Rounded-full) */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama pengaju atau isi pesan..."
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

            {/* Custom Category Dropdown (Rounded-full) */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsLimitDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedCategory !== 'all'
                    ? 'bg-[#EEF2FF] text-[#4941EC] border-[#4941EC]/30'
                    : 'bg-[#F6F7FB] text-gray-700 border-transparent hover:bg-white hover:border-gray-200'
                }`}
              >
                <span className="truncate max-w-[150px]">
                  {selectedCategory === 'all'
                    ? 'Semua Kategori'
                    : CATEGORY_CONFIG[selectedCategory as FeedbackCategory]?.label || selectedCategory}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isCategoryDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                  }`}
                />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { value: 'all', label: 'Semua Kategori' },
                    { value: 'bug', label: 'Laporan Bug / Error' },
                    { value: 'feature', label: 'Usulan Fitur Baru' },
                    { value: 'question', label: 'Pertanyaan Umum' },
                    { value: 'other', label: 'Lainnya' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        setSelectedCategory(opt.value);
                        setIsCategoryDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCategory === opt.value
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

            {/* Custom Status Dropdown (Rounded-full) */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsCategoryDropdownOpen(false);
                  setIsLimitDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedStatus !== 'all'
                    ? 'bg-[#EEF2FF] text-[#4941EC] border-[#4941EC]/30'
                    : 'bg-[#F6F7FB] text-gray-700 border-transparent hover:bg-white hover:border-gray-200'
                }`}
              >
                <span className="truncate max-w-[140px]">
                  {selectedStatus === 'all'
                    ? 'Semua Status'
                    : STATUS_CONFIG[selectedStatus as FeedbackStatus]?.label || selectedStatus}
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
                    { value: 'unread', label: 'Belum Dibaca' },
                    { value: 'in_progress', label: 'Dalam Proses' },
                    { value: 'resolved', label: 'Selesai' },
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

            {/* Reset Filter Button (Clean text only, no icon) */}
            {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
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
            <span>Pengelolaan Feedback Pengguna</span>
          </div>
        </div>

        {/* FEEDBACK TABLE (CLEAN HEADER WITH NO GRAY FILL AND ZERO CAPSLOCK) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                <th className="py-3 px-5 sm:px-6">Tgl & Pengaju</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Isi Pesan / Catatan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-5 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedFeedback.map((item) => {
                const categoryConf = CATEGORY_CONFIG[item.category];

                return (
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
                        {item.submitterName}
                      </p>
                    </td>

                    {/* Kategori */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${categoryConf.badgeClass}`}
                        >
                          {item.rating ? 'Ulasan' : categoryConf.label}
                        </span>
                        {typeof item.rating === 'number' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>{item.rating}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Isi Pesan / Catatan */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 max-w-[340px] sm:max-w-[420px]">
                        <p className="text-gray-800 line-clamp-1 text-xs">
                          {item.message}
                        </p>
                        {item.attachmentName && (
                          <span className="shrink-0 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                            [Lampiran]
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {item.status === 'unread' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Belum Dibaca
                        </span>
                      ) : item.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Dalam Proses
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Selesai
                        </span>
                      )}
                    </td>

                    {/* Aksi Button (WITHOUT ICON) */}
                    <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(item)}
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 ${
                          item.status === 'unread'
                            ? 'bg-[#4941EC] hover:bg-[#3D35DA] text-white'
                            : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Baca & Tanggapi
                      </button>
                    </td>
                  </tr>
                );
              })}

              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#4941EC] mx-auto mb-2" />
                    <span className="text-xs">Memuat pesan saran & masukan dari database...</span>
                  </td>
                </tr>
              )}

              {!isLoading && feedbackList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="w-8 h-8 stroke-[1.5] text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">
                        Belum Ada Saran & Masukan
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Saat ini belum ada kritik, saran, atau laporan dari pengguna yang tercatat dalam sistem.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && feedbackList.length > 0 && paginatedFeedback.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 stroke-[1.5] text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">
                        Tidak Ada Saran & Masukan yang Sesuai
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter status/kategori.
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
            {totalItems > 0 ? (
              <span>
                Menampilkan{' '}
                <strong className="text-gray-900 font-semibold">{startItem}</strong> -{' '}
                <strong className="text-gray-900 font-semibold">{endItem}</strong> dari{' '}
                <strong className="text-gray-900 font-semibold">{totalItems}</strong> data
              </span>
            ) : (
              <span>Menampilkan 0 data</span>
            )}
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
                  setIsCategoryDropdownOpen(false);
                  setIsStatusDropdownOpen(false);
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

      {/* MODAL: FORM DETAIL & TANGGAPAN SARAN / MASUKAN PENGGUNA */}
      {selectedFeedback && (
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
                  Form Detail & Tanggapan Saran / Masukan Pengguna
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tinjau aspirasi pengguna dan kirimkan tanggapan resmi tim pengelola WebGIS
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                aria-label="Tutup form"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* 1. Informasi Pengirim */}
              <div className="p-4 rounded-2xl bg-[#FBFBFE] border border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-gray-700 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#4941EC]" />
                    Informasi Pengirim
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    {selectedFeedback.date}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div>
                    <span className="text-xs text-gray-500">Pengaju:{' '}</span>
                    <strong className="text-xs sm:text-sm font-semibold text-gray-900">
                      {selectedFeedback.submitterName}
                    </strong>
                    <span className="text-xs text-gray-500 ml-1">
                      ({selectedFeedback.submitterEmail})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {typeof selectedFeedback.rating === 'number' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>Rating: {selectedFeedback.rating}/5</span>
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        CATEGORY_CONFIG[selectedFeedback.category].badgeClass
                      }`}
                    >
                      {CATEGORY_CONFIG[selectedFeedback.category].label}
                    </span>
                  </div>
                </div>
                {selectedFeedback.tripTitle && (
                  <div className="pt-1 border-t border-gray-100 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <span>Konteks Perjalanan:</span>
                    <strong className="font-semibold text-gray-900">{selectedFeedback.tripTitle}</strong>
                  </div>
                )}
              </div>

              {/* 2. Isi Pesan Pengguna */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Isi Pesan Pengguna:
                </label>
                <div className="p-4 rounded-2xl bg-gray-50/90 border border-gray-200/80 text-xs sm:text-sm text-gray-900 leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>

                {/* Lampiran Tangkapan Layar (if any) */}
                {selectedFeedback.attachmentName && (
                  <div className="pt-1">
                    <div className="p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-4 h-4 text-[#4941EC] shrink-0" />
                        <span className="text-gray-500 font-medium">Lampiran:</span>
                        <span className="font-semibold text-gray-800 truncate">
                          {selectedFeedback.attachmentName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAttachmentPreview(!showAttachmentPreview)}
                        className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4941EC] hover:bg-[#E0E7FF] text-xs font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        {showAttachmentPreview ? 'Tutup Lampiran' : 'Buka Lampiran'}
                      </button>
                    </div>

                    {showAttachmentPreview && (
                      <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 animate-in fade-in duration-200 text-center">
                        <div className="w-full h-44 rounded-lg bg-gray-200 flex flex-col items-center justify-center text-gray-500 gap-1.5 border border-dashed border-gray-300">
                          <Paperclip className="w-6 h-6 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-700">
                            {selectedFeedback.attachmentName}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Pratinjau visual tangkapan layar laporan kendala
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Update Status Penanganan */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800">
                  Update Status Penanganan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['unread', 'in_progress', 'resolved'] as FeedbackStatus[]).map((st) => {
                    const isSelected = editStatus === st;
                    const conf = STATUS_CONFIG[st];

                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setEditStatus(st)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#EEF2FF] border-[#4941EC] text-[#4941EC] ring-1 ring-[#4941EC]'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#4941EC] bg-[#4941EC]'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-semibold">{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Pesan Balasan Admin (Dikirim ke Notifikasi / Email User) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    Pesan Balasan Admin (Dikirim ke Notifikasi / Email User):
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Otomatis sinkron ke akun pengirim
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Tuliskan pesan balasan resmi untuk pengguna..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#4941EC]/30 focus:bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all resize-none"
                />

                {/* Quick Templates */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#4941EC]" />
                    Template Balasan Cepat:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setReplyMessage(tmpl)}
                        className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-medium transition-colors cursor-pointer text-left line-clamp-1"
                        title={tmpl}
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm Delete Section (if triggered) */}
              {confirmDeleteId && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                  <span>Yakin ingin menghapus masukan ini secara permanen?</span>
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
                      onClick={() => handleDeleteFeedback(confirmDeleteId)}
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
                onClick={handleSaveResponse}
                className="px-5 py-2 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Kirim Balasan & Simpan Status
              </button>

              {/* Secondary Actions (Right) */}
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(selectedFeedback.id)}
                  className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hapus Masukan
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
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
