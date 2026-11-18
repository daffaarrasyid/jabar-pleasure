'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  Filter,
  Image as ImageIcon,
  Video,
  Play,
  X,
  ExternalLink,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  ApiAdminMedia,
  getAdminMediaPaginated,
  deleteAdminMedia,
} from '@/lib/api';

type MediaFilterType = 'all' | 'photo' | 'video';

export default function AdminMediaTab() {
  const [mediaList, setMediaList] = useState<ApiAdminMedia[]>([]);
  const [typeFilter, setTypeFilter] = useState<MediaFilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 24,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ApiAdminMedia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiAdminMedia | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminMediaPaginated({
        page: currentPage,
        per_page: 24,
        type: typeFilter === 'all' ? undefined : typeFilter,
      });

      if (Array.isArray(res.data)) {
        setMediaList(res.data);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load journal media:', err);
      showToast('Gagal memuat media dokumentasi jurnal.', true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, typeFilter]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleOpenDelete = (m: ApiAdminMedia, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget(m);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsActionLoading(true);
    try {
      await deleteAdminMedia(deleteTarget.id);
      showToast('Media jurnal berhasil dihapus.');
      setIsDeleteModalOpen(false);
      if (selectedMedia?.id === deleteTarget.id) {
        setSelectedMedia(null);
      }
      setDeleteTarget(null);
      loadMedia();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus media.', true);
    } finally {
      setIsActionLoading(false);
    }
  };

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
              Moderasi Media Dokumentasi Jurnal
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Pantau dan kurasi foto serta video yang diunggah pengguna saat check-in perjalanan
            </p>
          </div>

          <button
            type="button"
            onClick={loadMedia}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 pt-2">
          {(
            [
              { id: 'all', label: 'Semua Media' },
              { id: 'photo', label: 'Foto' },
              { id: 'video', label: 'Video' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setTypeFilter(opt.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                typeFilter === opt.id
                  ? 'bg-[#4941EC] text-white shadow-[0_2px_8px_rgba(73,65,236,0.25)]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 sm:p-6">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2.5 text-gray-400 text-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#4941EC]" />
            <span>Memuat galeri media dokumentasi...</span>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-700">Tidak ada media ditemukan</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Belum ada foto atau video jurnal yang diunggah untuk kategori filter ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {mediaList.map((m) => {
              const isVideo = m.media_type === 'video';

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMedia(m)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Media Thumbnail */}
                  {isVideo ? (
                    <video
                      src={m.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.url}
                      alt={m.caption || 'Journal Media'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 opacity-60 group-hover:opacity-90 transition-opacity" />

                  {/* Media Type Badge (Top-left) */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold">
                      {isVideo ? <Video className="w-2.5 h-2.5 text-[#EDAD40]" /> : <ImageIcon className="w-2.5 h-2.5 text-[#60CE9F]" />}
                      <span className="capitalize">{m.media_type}</span>
                    </span>
                  </div>

                  {/* Delete Button with Trash Icon (Top-right) */}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      type="button"
                      onClick={(e) => handleOpenDelete(m, e)}
                      title="Hapus media"
                      className="p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-xs active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Center Play Icon for Video */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-xs">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Submitter & Destination */}
                  <div className="absolute bottom-2 left-2 right-2 z-10 text-white">
                    <p className="text-[10px] font-bold truncate drop-shadow-xs">
                      {m.check_in?.destination?.name || 'Destinasi Jabar'}
                    </p>
                    <p className="text-[9px] text-gray-200 truncate drop-shadow-xs">
                      {m.check_in?.user?.name ? `@${m.check_in.user.name}` : '@pengguna'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100 text-xs text-gray-600">
            <div>
              Menampilkan <span className="font-semibold text-gray-900">{mediaList.length}</span> dari{' '}
              <span className="font-semibold text-gray-900">{pagination.total}</span> file media
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
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
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Inspection Preview Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedMedia(null)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4941EC] bg-[#EEF0FF] px-2 py-0.5 rounded-md">
                  Pratinjau Media Jurnal
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  ({selectedMedia.media_type})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Trash Icon Button */}
                <button
                  type="button"
                  onClick={() => handleOpenDelete(selectedMedia)}
                  title="Hapus media ini"
                  className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMedia(null)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Display Area */}
            <div className="bg-black flex items-center justify-center max-h-[55vh] overflow-hidden">
              {selectedMedia.media_type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-h-[55vh] w-auto mx-auto object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.caption || 'Journal Media Full'}
                  className="max-h-[55vh] w-auto mx-auto object-contain"
                />
              )}
            </div>

            {/* Metadata Footer */}
            <div className="p-4 sm:p-5 space-y-3 text-xs bg-white">
              {selectedMedia.caption && (
                <p className="text-gray-800 font-medium italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  &ldquo;{selectedMedia.caption}&rdquo;
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Pengunggah</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {selectedMedia.check_in?.user?.name || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#60CE9F]" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Destinasi</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {selectedMedia.check_in?.destination?.name || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Waktu Unggah</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {new Date(selectedMedia.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Hapus File Media Ini?</h3>
              <p className="text-xs text-gray-500">
                Media jurnal dokumentasi yang diunggah pengguna akan dihapus permanen dari sistem JabarPleasure.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

