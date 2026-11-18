'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  MapPin,
  ExternalLink,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  ApiCategory,
  ApiDestination,
  getCategories,
  getAdminDestinationsPaginated,
  createAdminDestination,
  updateAdminDestination,
  deleteAdminDestination,
} from '@/lib/api';
import AdminPoiModal from './AdminPoiModal';

export default function AdminPoiTab() {
  const [destinations, setDestinations] = useState<ApiDestination[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<ApiDestination | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ApiDestination | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load categories
  useEffect(() => {
    getCategories().then((cats) => {
      if (Array.isArray(cats)) setCategories(cats);
    });
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadDestinations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminDestinationsPaginated({
        page: currentPage,
        per_page: 15,
        search: debouncedSearch || undefined,
        category_id: selectedCategory === 'all' ? undefined : selectedCategory,
      });

      if (Array.isArray(res.data)) {
        setDestinations(res.data);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load destinations:', err);
      showToast('Gagal memuat data destinasi wisata.', true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory]);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  const handleOpenCreate = () => {
    setSelectedDestination(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dest: ApiDestination) => {
    setSelectedDestination(dest);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: any, isEdit: boolean) => {
    setIsActionLoading(true);
    try {
      if (isEdit && selectedDestination) {
        await updateAdminDestination(selectedDestination.id, payload);
        showToast(`Destinasi '${payload.name}' berhasil diperbarui!`);
      } else {
        await createAdminDestination(payload);
        showToast(`Destinasi '${payload.name}' berhasil diterbitkan ke peta!`);
      }
      setIsModalOpen(false);
      loadDestinations();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data destinasi.', true);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenDelete = (dest: ApiDestination) => {
    setDeleteTarget(dest);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsActionLoading(true);
    try {
      await deleteAdminDestination(deleteTarget.id);
      showToast(`Destinasi '${deleteTarget.name}' berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      loadDestinations();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus destinasi.', true);
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

      {/* Header and Action Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Data POI Destinasi Wisata
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Kelola katalog seluruh titik Point of Interest wisata di wilayah Provinsi Jawa Barat
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={loadDestinations}
              disabled={isLoading}
              className="p-2 sm:px-3 sm:py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1.5">Segarkan</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4941EC] hover:bg-[#3C35C7] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_2px_10px_rgba(73,65,236,0.25)]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah POI Baru</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Kategori:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#F6F8FB] border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-[#4941EC]"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau alamat destinasi..."
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
            <span>Memuat data destinasi wisata...</span>
          </div>
        ) : destinations.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-700">Tidak ada destinasi ditemukan</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Tidak ada data POI yang sesuai dengan filter atau kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Destinasi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Wilayah</th>
                  <th className="py-3 px-4">Tiket & Jam</th>
                  <th className="py-3 px-4">Koordinat Spasial</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {destinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Destination name & thumbnail */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {dest.cover_image_url || dest.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={dest.cover_image_url || dest.cover_image || ''}
                            alt={dest.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100"
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0 font-bold text-xs">
                            {dest.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                            {dest.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                            {dest.address || 'Jawa Barat'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#EEF2FF] text-[#4941EC] text-[10px] font-semibold">
                        {dest.category?.name || 'Destinasi'}
                      </span>
                    </td>

                    {/* Regency */}
                    <td className="py-3.5 px-4 text-gray-600 font-medium whitespace-nowrap">
                      {dest.regency?.name || 'Jawa Barat'}
                    </td>

                    {/* Price & Hours */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      <p className="text-gray-800 font-medium">{dest.price_range || 'Menyesuaikan'}</p>
                      <p className="text-[10px] text-gray-400">{dest.opening_hours || 'Setiap Hari'}</p>
                    </td>

                    {/* Spatial coordinates */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                      {dest.latitude && dest.longitude ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${dest.latitude},${dest.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#4941EC] flex items-center gap-1 group"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#60CE9F] group-hover:text-[#4941EC]" />
                          <span>
                            {Number(dest.latitude).toFixed(4)}, {Number(dest.longitude).toFixed(4)}
                          </span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-gray-300">Geometri aktif</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(dest)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#4941EC] hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Edit destinasi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(dest)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus destinasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
              dari <span className="font-semibold text-gray-900">{pagination.total}</span> destinasi
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

      {/* Add / Edit Modal */}
      <AdminPoiModal
        isOpen={isModalOpen}
        destination={selectedDestination}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isLoading={isActionLoading}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Hapus Destinasi Wisata?</h3>
              <p className="text-xs text-gray-500">
                Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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

