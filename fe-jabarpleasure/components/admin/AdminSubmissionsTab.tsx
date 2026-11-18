'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import InspectionModal, { PendingSubmission } from './InspectionModal';
import {
  getAdminSubmissionsPaginated,
  approveSubmission,
  rejectSubmission,
} from '@/lib/api';

type SubmissionFilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminSubmissionsTab() {
  const [statusFilter, setStatusFilter] = useState<SubmissionFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminSubmissionsPaginated({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        page: currentPage,
        per_page: 15,
      });

      if (Array.isArray(res.data)) {
        const mapped: PendingSubmission[] = res.data.map((item: any) => {
          const lat = item.latitude ?? (item.proposed_location?.coordinates ? item.proposed_location.coordinates[1] : null);
          const lng = item.longitude ?? (item.proposed_location?.coordinates ? item.proposed_location.coordinates[0] : null);

          let locationText = 'Koordinat Peta';
          if (lat && lng) {
            locationText = `Lat: ${Number(lat).toFixed(4)}, Long: ${Number(lng).toFixed(4)}`;
          }

          const rawDate = item.created_at ? new Date(item.created_at) : new Date();
          const formattedDate = rawDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB';

          return {
            id: item.id,
            name: item.name,
            submitter: item.user?.name ? `@${item.user.name}` : '@pengguna',
            category: item.category?.name || 'Destinasi Wisata',
            locationMethod: item.evidence_image?.startsWith('http') ? 'Link Google Maps' : 'GPS Realtime',
            coordsOrUrl: item.evidence_image?.startsWith('http') ? item.evidence_image : locationText,
            date: formattedDate,
            status: item.status || 'pending',
            description: item.description,
            price_range: item.price_range,
            opening_hours: item.opening_hours,
            evidence_image: item.evidence_image,
            admin_note: item.admin_note,
          };
        });

        setSubmissions(mapped);
      }

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
      showToast('Gagal memuat daftar pengajuan destinasi.', true);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, debouncedSearch, currentPage]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleOpenInspection = (sub: PendingSubmission) => {
    setSelectedSubmission(sub);
    setIsModalOpen(true);
  };

  const handleApprove = async (id: number | string, adminNote?: string) => {
    setIsActionLoading(true);
    try {
      await approveSubmission(id, adminNote);
      setIsModalOpen(false);
      showToast('Pengajuan destinasi disetujui & dipublikasikan ke peta publik!');
      loadSubmissions();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui pengajuan.', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (id: number | string, adminNote?: string) => {
    setIsActionLoading(true);
    try {
      await rejectSubmission(id, adminNote);
      setIsModalOpen(false);
      showToast('Pengajuan destinasi telah ditolak.');
      loadSubmissions();
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak pengajuan.', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  const statusOptions: Array<{ id: SubmissionFilterStatus; label: string }> = [
    { id: 'all', label: 'Semua Pengajuan' },
    { id: 'pending', label: 'Menunggu Kurasi' },
    { id: 'approved', label: 'Disetujui' },
    { id: 'rejected', label: 'Ditolak' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-top-4 ${
            toastMessage.isError ? 'bg-red-600' : 'bg-gray-900'
          }`}
        >
          {toastMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#60CE9F]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Validasi Pengajuan Lokasi Destinasi
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Kurasi titik POI dan koordinat spasial yang diajukan oleh pengguna komunitas JabarPleasure
            </p>
          </div>

          <button
            type="button"
            onClick={loadSubmissions}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setStatusFilter(opt.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === opt.id
                    ? 'bg-[#4941EC] text-white shadow-[0_2px_8px_rgba(73,65,236,0.25)]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama destinasi atau pengaju..."
              className="w-full bg-[#F6F8FB] border border-gray-200 rounded-full pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#4941EC] focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-gray-400 text-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#4941EC]" />
            <span>Memuat data pengajuan...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-700">Tidak ada pengajuan ditemukan</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Tidak ada data yang cocok dengan kriteria filter status atau kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Nama Destinasi</th>
                  <th className="py-3 px-4">Pengaju</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Metode Lokasi</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Destination name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-gray-900">{sub.name}</div>
                      {sub.admin_note && (
                        <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 italic">
                          Catatan: {sub.admin_note}
                        </div>
                      )}
                    </td>

                    {/* Submitter */}
                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {sub.submitter}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#EEF2FF] text-[#4941EC] text-[10px] font-semibold whitespace-nowrap">
                        {sub.category}
                      </span>
                    </td>

                    {/* Location Method */}
                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#60CE9F] shrink-0" />
                        <span className="truncate max-w-[140px]">{sub.locationMethod}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {sub.date}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {sub.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" />
                          <span>Disetujui</span>
                        </span>
                      ) : sub.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>Ditolak</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          <span>Menunggu</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenInspection(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#4941EC]" />
                        <span>Tinjau</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 border-t border-gray-100 bg-gray-50/40 text-xs text-gray-600">
            <div>
              Menampilkan{' '}
              <span className="font-semibold text-gray-900">
                {(pagination.current_page - 1) * pagination.per_page + 1}
              </span>{' '}
              sampai{' '}
              <span className="font-semibold text-gray-900">
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
              </span>{' '}
              dari <span className="font-semibold text-gray-900">{pagination.total}</span> pengajuan
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800">
                {pagination.current_page} / {pagination.last_page || 1}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page >= pagination.last_page}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      <InspectionModal
        isOpen={isModalOpen}
        submission={selectedSubmission}
        isLoading={isActionLoading}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
