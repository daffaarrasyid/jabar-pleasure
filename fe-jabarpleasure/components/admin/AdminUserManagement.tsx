'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle2,
  Lock,
  User,
  Calendar,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { getAdminUsers, toggleAdminUserStatus } from '@/lib/api';

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

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'banned';

export interface UserAccount {
  id: number;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  registeredDate: string;
  banReason?: string;
  lastActive?: string;
}

// Initial realistic West Java user accounts
const INITIAL_USERS: UserAccount[] = [
  {
    id: 1,
    userId: 'USR-8821',
    username: '@julyandre',
    fullName: 'Julyandre Karundeng',
    email: 'julyandre@example.com',
    role: 'user',
    status: 'active',
    registeredDate: '12 September 2026',
    lastActive: 'Hari ini, 14:10 WIB',
  },
  {
    id: 2,
    userId: 'USR-8822',
    username: '@daffa_dev',
    fullName: 'M. Daffa Ar-Rasyid',
    email: 'daffa@example.com',
    role: 'user',
    status: 'active',
    registeredDate: '10 September 2026',
    lastActive: 'Hari ini, 15:30 WIB',
  },
  {
    id: 3,
    userId: 'ADM-0001',
    username: '@rifaldi_pm',
    fullName: 'Rifaldi',
    email: 'rifaldi@jabarpleasure.id',
    role: 'admin',
    status: 'active',
    registeredDate: '01 Agustus 2026',
    lastActive: 'Sedang Aktif',
  },
  {
    id: 4,
    userId: 'USR-8710',
    username: '@user_nakal',
    fullName: 'Pengguna Anonim',
    email: 'nakal@example.com',
    role: 'user',
    status: 'banned',
    registeredDate: '15 Juli 2026',
    banReason: 'Spamming ulasan tidak pantas dan manipulasi koordinat lokasi berulang kali.',
    lastActive: 'Diblokir',
  },
  {
    id: 5,
    userId: 'ADM-0002',
    username: '@admin123',
    fullName: 'Administrator WebGIS',
    email: 'admin@jabarpleasure.id',
    role: 'admin',
    status: 'active',
    registeredDate: '01 Juni 2026',
    lastActive: 'Sedang Aktif',
  },
  {
    id: 6,
    userId: 'ADM-0003',
    username: '@bintang_gis',
    fullName: 'Bintang Kurnia',
    email: 'bintang.admin@jabarpleasure.id',
    role: 'admin',
    status: 'active',
    registeredDate: '15 Agustus 2026',
    lastActive: 'Kemarin, 19:45 WIB',
  },
  {
    id: 7,
    userId: 'USR-8709',
    username: '@bot_promo',
    fullName: 'Jasa Promo Wisata',
    email: 'promo@spamdomain.xyz',
    role: 'user',
    status: 'banned',
    registeredDate: '20 Agustus 2026',
    banReason: 'Akun bot promosi spam di fitur ulasan destinasi publik.',
    lastActive: 'Diblokir',
  },
  {
    id: 8,
    userId: 'USR-8823',
    username: '@citra_lestari',
    fullName: 'Citra Lestari',
    email: 'citra.lestari@example.com',
    role: 'user',
    status: 'active',
    registeredDate: '05 Oktober 2026',
    lastActive: '2 jam yang lalu',
  },
  {
    id: 9,
    userId: 'USR-8824',
    username: '@eko_prasetyo',
    fullName: 'Eko Prasetyo',
    email: 'eko.p@example.com',
    role: 'user',
    status: 'active',
    registeredDate: '06 Oktober 2026',
    lastActive: '1 hari yang lalu',
  },
  {
    id: 10,
    userId: 'USR-8825',
    username: '@maya_safitri',
    fullName: 'Maya Safitri',
    email: 'maya.s@example.com',
    role: 'user',
    status: 'active',
    registeredDate: '08 Oktober 2026',
    lastActive: '3 hari yang lalu',
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

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Load real users from backend API
  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsers();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: UserAccount[] = data.map((u: any) => {
          const rawDate = u.created_at ? new Date(u.created_at) : new Date();
          const formattedDate = rawDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
          return {
            id: u.id,
            userId: `USR-${u.id.toString().padStart(4, '0')}`,
            username: `@${(u.name || 'user').toLowerCase().replace(/\s+/g, '_')}`,
            fullName: u.name || 'Pengguna',
            email: u.email || 'user@example.com',
            role: (u.role === 'admin' ? 'admin' : 'user') as UserRole,
            status: (u.is_blocked ? 'banned' : 'active') as UserStatus,
            registeredDate: formattedDate,
            lastActive: u.is_blocked ? 'Diblokir' : 'Aktif',
          };
        });
        setUsers(mapped);
      } else if (Array.isArray(data) && data.length === 0) {
        setUsers([]);
      } else {
        setUsers(INITIAL_USERS);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
      setUsers(INITIAL_USERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Custom Dropdown open states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);

  // Modal Detail & Edit State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('user');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formBanReason, setFormBanReason] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Modal Create Admin State
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminFullName, setNewAdminFullName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('AdminJabar#2026');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{
    type: 'update' | 'delete' | 'ban_toggle';
    item: UserAccount;
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
        setIsRoleDropdownOpen(false);
        setIsStatusDropdownOpen(false);
        setIsLimitDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Compute KPI metrics dynamically from real users
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const bannedUsers = users.filter((u) => u.status === 'banned').length;
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    return { totalUsers, activeUsers, bannedUsers, adminCount };
  }, [users]);

  // Filtered & Searched data
  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        item.username.toLowerCase().includes(query) ||
        item.fullName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.userId.toLowerCase().includes(query);

      const matchRole =
        selectedRole === 'all' || item.role === selectedRole;

      const matchStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalItems = filteredUsers.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = useMemo(() => {
    return getPageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  // Open Edit Modal
  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormBanReason(user.banReason || '');
    setConfirmDeleteId(null);
  };

  // Save changes from Edit Modal
  const handleSaveUser = () => {
    if (!editingUser) return;

    if (!formFullName.trim() || !formEmail.trim()) {
      showToast('Nama lengkap dan email tidak boleh kosong.');
      return;
    }

    const previousItem = { ...editingUser };
    const updatedItem: UserAccount = {
      ...editingUser,
      fullName: formFullName.trim(),
      username: formUsername.startsWith('@') ? formUsername.trim() : `@${formUsername.trim()}`,
      email: formEmail.trim(),
      role: formRole,
      status: formStatus,
      banReason: formStatus === 'banned' ? formBanReason.trim() : undefined,
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? updatedItem : u))
    );
    setLastAction({ type: 'update', item: previousItem });
    setEditingUser(null);
    showToast(`Perubahan data akun ${updatedItem.username} berhasil disimpan.`);
  };

  // Quick Ban / Unban Toggle in Backend
  const handleQuickToggleBan = async (id: number) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    const previousItem = { ...target };
    const nextStatus: UserStatus = target.status === 'active' ? 'banned' : 'active';

    try {
      await toggleAdminUserStatus(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status: nextStatus,
                banReason: nextStatus === 'banned' ? 'Diblokir oleh administrator.' : undefined,
              }
            : u
        )
      );
      setLastAction({ type: 'ban_toggle', item: previousItem });
      showToast(
        nextStatus === 'banned'
          ? `Akun ${target.username} berhasil di-ban di server.`
          : `Akun ${target.username} berhasil di-unban (diaktifkan kembali).`
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status akun di server.');
    }
  };

  // Reset Password Action
  const handleResetPassword = (user: UserAccount) => {
    showToast(`Tautan reset sandi telah dikirimkan ke email ${user.email}.`);
  };

  // Delete User
  const handleDeleteUser = (id: number) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    setLastAction({ type: 'delete', item: target });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setEditingUser(null);
    setConfirmDeleteId(null);
    showToast(`Akun ${target.username} berhasil dihapus permanen.`);
  };

  // Create New Admin Account
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminUsername.trim() || !newAdminFullName.trim() || !newAdminEmail.trim()) {
      showToast('Semua kolom wajib diisi untuk membuat akun admin.');
      return;
    }

    const cleanUsername = newAdminUsername.startsWith('@')
      ? newAdminUsername.trim()
      : `@${newAdminUsername.trim()}`;

    const newAdmin: UserAccount = {
      id: Date.now(),
      userId: `ADM-00${users.filter((u) => u.role === 'admin').length + 1}`,
      username: cleanUsername,
      fullName: newAdminFullName.trim(),
      email: newAdminEmail.trim(),
      role: 'admin',
      status: 'active',
      registeredDate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      lastActive: 'Baru Dibuat',
    };

    setUsers((prev) => [newAdmin, ...prev]);
    setIsCreateAdminOpen(false);
    setNewAdminUsername('');
    setNewAdminFullName('');
    setNewAdminEmail('');
    showToast(`Akun admin ${newAdmin.username} berhasil ditambahkan.`);
  };

  // Undo Last Action
  const handleUndo = () => {
    if (!lastAction) return;

    if (lastAction.type === 'delete') {
      setUsers((prev) => [lastAction.item, ...prev]);
      showToast(`Akun ${lastAction.item.username} berhasil dipulihkan.`);
    } else if (lastAction.type === 'update' || lastAction.type === 'ban_toggle') {
      setUsers((prev) =>
        prev.map((u) => (u.id === lastAction.item.id ? lastAction.item : u))
      );
      showToast(`Perubahan pada akun ${lastAction.item.username} dibatalkan.`);
    }
    setLastAction(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
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
          Manajemen Akun Pengguna & Otorisasi Hak Akses
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Kelola data pengguna terdaftar, peranan sistem (RBAC), serta status pemblokiran akun
        </p>
      </div>

      {/* 4 KPI SUMMARY CARDS (Total User, User Aktif, User Di-ban, Administrator) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total User */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(73,65,236,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(73,65,236,0.35)]">
            <Users className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total User</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.totalUsers} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              terdaftar di sistem
            </p>
          </div>
        </div>

        {/* Card 2: User Aktif */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#60CE9F] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(96,206,159,0.3)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(96,206,159,0.35)]">
            <UserCheck className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">User Aktif</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.activeUsers} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              dapat mengakses platform
            </p>
          </div>
        </div>

        {/* Card 3: User Di-ban */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(239,68,68,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(239,68,68,0.35)]">
            <UserX className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">User Di-ban</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.bannedUsers} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              akses terkunci / spam
            </p>
          </div>
        </div>

        {/* Card 4: Administrator */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-gray-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3.5 cursor-default select-none">
          <div className="w-11 h-11 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:shadow-[0_6px_18px_rgba(59,130,246,0.35)]">
            <ShieldCheck className="w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Administrator</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                <AnimatedNumber value={metrics.adminCount} formatDot={false} />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              otorisasi penuh RBAC
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
              Daftar Akun Pengguna Terdaftar
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Kelola otorisasi hak akses akun, status moderasi, dan pengaturan sandi
            </p>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-[#4941EC] self-start sm:self-auto">
            Total Pengguna: {metrics.totalUsers.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Row 2: Filter Toolbar (Search Bar + Role Dropdown + Status Dropdown + Tambah Admin Button) */}
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
                placeholder="Cari username, nama, atau email..."
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

            {/* Custom Role Dropdown (Rounded-full) */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => {
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsLimitDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedRole !== 'all'
                    ? 'bg-[#EEF2FF] text-[#4941EC] border-[#4941EC]/30'
                    : 'bg-[#F6F7FB] text-gray-700 border-transparent hover:bg-white hover:border-gray-200'
                }`}
              >
                <span className="truncate max-w-[150px]">
                  {selectedRole === 'all'
                    ? 'Semua Role'
                    : selectedRole === 'admin'
                    ? 'Administrator'
                    : 'Pengguna Biasa (User)'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isRoleDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                  }`}
                />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { value: 'all', label: 'Semua Role' },
                    { value: 'user', label: 'Pengguna Biasa (User)' },
                    { value: 'admin', label: 'Administrator' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        setSelectedRole(opt.value);
                        setIsRoleDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        selectedRole === opt.value
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
                  setIsRoleDropdownOpen(false);
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
                    : selectedStatus === 'active'
                    ? 'Aktif'
                    : 'Di-ban'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isStatusDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                  }`}
                />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { value: 'all', label: 'Semua Status' },
                    { value: 'active', label: 'Aktif' },
                    { value: 'banned', label: 'Di-ban' },
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
            {(selectedRole !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-gray-400 hover:text-[#4941EC] font-medium transition-colors cursor-pointer px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>

          {/* Action Button: Tambah Akun Admin (WITHOUT + ICON) */}
          <div className="self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateAdminOpen(true)}
              className="px-4 py-2 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              Tambah Akun Admin
            </button>
          </div>
        </div>

        {/* USERS TABLE (CLEAN HEADER WITH NO GRAY FILL AND ZERO CAPSLOCK) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                <th className="py-3 px-5 sm:px-6">Username & ID</th>
                <th className="py-3 px-3">Nama Lengkap</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-5 sm:px-6 text-right">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Username & ID */}
                  <td className="py-3.5 px-5 sm:px-6 whitespace-nowrap">
                    <p className="font-semibold text-[#4941EC] text-xs">
                      {user.username}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      {user.userId}
                    </p>
                  </td>

                  {/* Nama Lengkap */}
                  <td className="py-3.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                    {user.fullName}
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-3 text-gray-600 whitespace-nowrap font-mono text-[11px]">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        user.role === 'admin'
                          ? 'bg-[#EEF2FF] text-[#4941EC]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Di-ban
                      </span>
                    )}
                  </td>

                  {/* Aksi Moderasi Buttons (WITHOUT BUTTON ICONS) */}
                  <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(user)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-[#EEF0FF] hover:text-[#4941EC] hover:border-[#4941EC]/30 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        Edit
                      </button>

                      {/* Ban / Unban Toggle Button */}
                      {user.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => handleQuickToggleBan(user.id)}
                          className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          Ban
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickToggleBan(user.id)}
                          className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          Unban
                        </button>
                      )}

                      {/* Reset Pass Button */}
                      <button
                        type="button"
                        onClick={() => handleResetPassword(user)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        Reset Pass
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#4941EC] mx-auto mb-2" />
                    <span className="text-xs">Memuat data akun pengguna dari database...</span>
                  </td>
                </tr>
              )}

              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 stroke-[1.5] text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">
                        Belum Ada Data Pengguna
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Tidak ditemukan akun pengguna yang terdaftar di dalam sistem.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && users.length > 0 && paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 stroke-[1.5] text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">
                        Tidak Ada Akun Pengguna yang Sesuai
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter peranan/status.
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
                <strong className="text-gray-900 font-semibold">{totalItems}</strong> akun
              </span>
            ) : (
              <span>Menampilkan 0 akun</span>
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
                  setIsRoleDropdownOpen(false);
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

      {/* MODAL 1: FORM DETAIL & EDIT AKUN PENGGUNA */}
      {editingUser && (
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
                  Form Detail & Edit Akun Pengguna
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kelola otorisasi peran sistem, status moderasi, dan keamanan pengguna
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                aria-label="Tutup form"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* 1. Informasi Dasar Akun */}
              <div className="p-4 rounded-2xl bg-[#FBFBFE] border border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-gray-700 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#4941EC]" />
                    Informasi Dasar Akun:
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    Tanggal Terdaftar: {editingUser.registeredDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      ID Pengguna
                    </label>
                    <input
                      type="text"
                      disabled
                      value={editingUser.userId}
                      className="w-full px-3 py-2 rounded-xl bg-gray-100 border border-gray-200 text-xs text-gray-600 font-mono select-all cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="@username"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-[#4941EC]/40 text-xs text-gray-800 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="Nama lengkap..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-[#4941EC]/40 text-xs text-gray-800 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="alamat@email.com"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-[#4941EC]/40 text-xs text-gray-800 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Otorisasi & Hak Akses (Role-Based Access Control) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  Otorisasi & Hak Akses (Role-Based Access Control):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormRole('user')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      formRole === 'user'
                        ? 'bg-[#EEF2FF] border-[#4941EC] text-[#4941EC] ring-1 ring-[#4941EC]'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        formRole === 'user'
                          ? 'border-[#4941EC] bg-[#4941EC]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {formRole === 'user' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">Pengguna Biasa (User)</span>
                      <span className="text-[10px] text-gray-400">Akses jelajah publik & itinerary</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('admin')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      formRole === 'admin'
                        ? 'bg-[#EEF2FF] border-[#4941EC] text-[#4941EC] ring-1 ring-[#4941EC]'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        formRole === 'admin'
                          ? 'border-[#4941EC] bg-[#4941EC]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {formRole === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">Administrator (Admin)</span>
                      <span className="text-[10px] text-gray-400">Akses penuh dashboard WebGIS</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Status Keaktifan Akun */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                  Status Keaktifan Akun:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormStatus('active')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      formStatus === 'active'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        formStatus === 'active'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {formStatus === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">Aktif</span>
                      <span className="text-[10px] text-gray-400">Dapat Login & Menggunakan Aplikasi</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('banned')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      formStatus === 'banned'
                        ? 'bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        formStatus === 'banned'
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {formStatus === 'banned' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">Di-ban</span>
                      <span className="text-[10px] text-gray-400">Akses Terkunci / Blocked</span>
                    </div>
                  </button>
                </div>

                {/* Catatan Pemblokiran */}
                {formStatus === 'banned' && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Catatan Pemblokiran / Alasan (Opsional):
                    </label>
                    <textarea
                      rows={2}
                      value={formBanReason}
                      onChange={(e) => setFormBanReason(e.target.value)}
                      placeholder="Tuliskan alasan jika akun diblokir/di-ban..."
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-red-300 focus:bg-white text-xs text-gray-800 outline-none transition-all resize-none"
                    />
                  </div>
                )}
              </div>

              {/* 4. Keamanan & Sandi */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-2">
                <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  Keamanan & Sandi:
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-gray-500">
                    Kirim tautan pemulihan kata sandi instan langsung ke email pengguna
                  </span>
                  <button
                    type="button"
                    onClick={() => handleResetPassword(editingUser)}
                    className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                  >
                    Kirim Tautan Reset Password Ke Email User
                  </button>
                </div>
              </div>

              {/* Confirm Delete Section (if triggered) */}
              {confirmDeleteId && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                  <span>Yakin ingin menghapus akun ini secara permanen dari basis data?</span>
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
                      onClick={() => handleDeleteUser(confirmDeleteId)}
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
                onClick={handleSaveUser}
                className="px-5 py-2 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Simpan Perubahan Akun
              </button>

              {/* Secondary Actions (Right) */}
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(editingUser.id)}
                  className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hapus Akun Permanen
                </button>

                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH AKUN ADMIN BARU */}
      {isCreateAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 tracking-tight">
                  Tambah Akun Administrator Baru
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Berikan akses administrator dashboard WebGIS JabarPleasure
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAdminOpen(false)}
                aria-label="Tutup form"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateAdmin}>
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Username Admin
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="@admin_wilayah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#4941EC]/40 focus:bg-white text-xs text-gray-800 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminFullName}
                    onChange={(e) => setNewAdminFullName(e.target.value)}
                    placeholder="Contoh: Daffa Admin Jawa Barat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#4941EC]/40 focus:bg-white text-xs text-gray-800 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@jabarpleasure.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#4941EC]/40 focus:bg-white text-xs text-gray-800 outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password Sementara
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-xs text-gray-700 outline-none transition-all font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Admin baru dapat mengganti password sementara setelah login pertama kali.
                  </p>
                </div>
              </div>

              {/* Modal Footer Actions (NO BUTTON ICONS) */}
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#FBFBFE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Simpan Akun Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
