'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  ApiAdminUser,
  getAdminUsersPaginated,
  toggleBlockUser,
} from '@/lib/api';

export default function AdminUsersTab() {
  const [users, setUsers] = useState<ApiAdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [targetUser, setTargetUser] = useState<ApiAdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminUsersPaginated({
        page: currentPage,
        per_page: 15,
        search: debouncedSearch || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (Array.isArray(res.data)) {
        setUsers(res.data);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('Gagal memuat daftar pengguna.', true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenToggleBlock = (u: ApiAdminUser) => {
    setTargetUser(u);
    setIsModalOpen(true);
  };

  const handleConfirmToggleBlock = async () => {
    if (!targetUser) return;
    setIsActionLoading(true);
    try {
      const result = await toggleBlockUser(targetUser.id);
      showToast(result.message);
      setIsModalOpen(false);
      setTargetUser(null);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status blokir pengguna.', true);
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

      {/* Header and Filter Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Akun Pengguna & Otoritas
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Pantau status akses, peran akun, dan kontrol keamanan pengguna terdaftar
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#F6F8FB] border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-[#4941EC]"
            >
              <option value="all">Semua Peran</option>
              <option value="admin">Administrator</option>
              <option value="user">Pengguna Umum</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#F6F8FB] border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-[#4941EC]"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="blocked">Terblokir</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau kota..."
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
            <span>Memuat data pengguna...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <UserIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-700">Tidak ada pengguna ditemukan</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Tidak ada akun yang sesuai dengan filter atau kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Pengguna</th>
                  <th className="py-3 px-4">Kontak & Kota</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4">Terdaftar</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Aksi Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                  const isBlocked = !!u.is_blocked;
                  const isSuperAdmin = u.email === 'admin123@jabarpleasure.id' || u.name === 'admin123';

                  const rawDate = u.created_at ? new Date(u.created_at) : new Date();
                  const formattedDate = rawDate.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar_url}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                              {u.name ? u.name.charAt(0) : 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-[180px]">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[180px]">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone & City */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        <p className="flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{u.phone || '-'}</span>
                        </p>
                        <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{u.city || 'Jawa Barat'}</span>
                        </p>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                            <Shield className="w-3 h-3" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
                            <UserIcon className="w-3 h-3" />
                            <span>Pengguna</span>
                          </span>
                        )}
                      </td>

                      {/* Blocked Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                            <Lock className="w-3 h-3" />
                            <span>Terblokir</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                            <Unlock className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                        {formattedDate}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        {isSuperAdmin ? (
                          <span className="text-[10px] text-gray-400 italic">Sistem Utama</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenToggleBlock(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                              isBlocked
                                ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                : 'border-red-200 text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Buka Blokir</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Blokir Akun</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
              dari <span className="font-semibold text-gray-900">{pagination.total}</span> akun
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

      {/* Toggle Block Confirmation Modal */}
      {isModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-gray-100">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                targetUser.is_blocked ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {targetUser.is_blocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-gray-900">
                {targetUser.is_blocked ? 'Buka Blokir Akun?' : 'Blokir Pengguna Ini?'}
              </h3>
              <p className="text-xs text-gray-500">
                {targetUser.is_blocked ? (
                  <span>
                    Pengguna <strong>{targetUser.name}</strong> akan dapat login dan menggunakan fitur aplikasi kembali.
                  </span>
                ) : (
                  <span>
                    Pengguna <strong>{targetUser.name}</strong> tidak akan dapat mengakses endpoint yang memerlukan autentikasi.
                  </span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleBlock}
                disabled={isActionLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 ${
                  targetUser.is_blocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{targetUser.is_blocked ? 'Ya, Buka Blokir' : 'Ya, Blokir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

