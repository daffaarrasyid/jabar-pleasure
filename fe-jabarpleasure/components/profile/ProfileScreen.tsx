'use client';

import React, { useEffect, useState } from 'react';
import {
  Pencil,
  User,
  SlidersHorizontal,
  Bell,
  BellOff,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { getAuthToken } from '@/lib/auth';
import { NOTIFICATION_EVENT } from '@/components/notification/NotificationSheet';
import EditProfileBottomSheet from './EditProfileBottomSheet';
import TravelPreferencesModal from './TravelPreferencesModal';
import PrivacySecurityModal from './PrivacySecurityModal';
import HelpCenterModal from './HelpCenterModal';

export interface UserProfileData {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  avatar_url?: string | null;
  initials?: string;
  role?: string;
  travel_style?: string;
  notifications_enabled?: boolean;
  location_permission_enabled?: boolean;
  statistics?: {
    trips_count?: number;
    wishlist_count?: number;
    itinerary_count?: number;
  };
  preferences?: Array<{ id?: number; name?: string; slug?: string }>;
}

interface ProfileScreenProps {
  user?: UserProfileData | null;
  isLoading?: boolean;
  onNavigateToHome?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToWishlist?: () => void;
  onNavigateToRencana?: () => void;
  onNavigateToRiwayat?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
  onItemClick?: (itemTitle: string) => void;
  onUserUpdate?: (updatedUser: UserProfileData) => void;
  wishlistCount?: number;
  className?: string;
}

export default function ProfileScreen({
  user,
  isLoading = false,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToWishlist,
  onNavigateToRencana,
  onNavigateToRiwayat,
  onNotificationClick,
  onWishlistClick,
  onLogout,
  onEditProfile,
  onItemClick,
  onUserUpdate,
  wishlistCount = 0,
  className = '',
}: ProfileScreenProps) {
  // Local state for user profile updates
  const [localUser, setLocalUser] = useState<UserProfileData | null>(null);
  const currentUser = localUser || user || null;

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isTravelPrefsOpen, setIsTravelPrefsOpen] = useState(false);
  const [isPrivacySecurityOpen, setIsPrivacySecurityOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [showNotificationConfirm, setShowNotificationConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Notification toggle state (synced with DB user.notifications_enabled)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jabarpleasure_notifications_enabled');
      return saved !== 'false';
    }
    return true;
  });

  useEffect(() => {
    if (typeof currentUser?.notifications_enabled === 'boolean') {
      setNotificationsEnabled(currentUser.notifications_enabled);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'jabarpleasure_notifications_enabled',
          String(currentUser.notifications_enabled)
        );
      }
    }
  }, [currentUser?.notifications_enabled]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const displayName = currentUser?.name || 'Pengguna JabarPleasure';
  const displayEmail = currentUser?.email || '';
  const displayCity = currentUser?.city || 'Jawa Barat, Indonesia';
  const displayInitials =
    currentUser?.initials ||
    (displayName !== 'Pengguna JabarPleasure'
      ? displayName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'JP');
  const tripsCount = currentUser?.statistics?.trips_count ?? 0;
  const effectiveWishlistCount = currentUser?.statistics?.wishlist_count ?? wishlistCount;
  const itineraryCount = currentUser?.statistics?.itinerary_count ?? 0;

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'rencana') {
      onNavigateToRencana?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    }
  };

  const handleProfileUpdateSuccess = (updated: UserProfileData) => {
    setLocalUser(updated);
    onUserUpdate?.(updated);
    showToast('Profil Anda berhasil diperbarui!');
  };

  const handlePreferencesSuccess = (
    preferences: Array<{ id?: number; name?: string; slug?: string }>,
    travelStyle?: string
  ) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        preferences,
        ...(travelStyle ? { travel_style: travelStyle } : {}),
      };
      setLocalUser(updated);
      onUserUpdate?.(updated);
    }
    showToast('Preferensi perjalanan berhasil disimpan!');
  };

  const handleConfirmToggleNotification = async () => {
    const nextState = !notificationsEnabled;
    const token = getAuthToken();

    try {
      const res = await fetch('/api/user/notifications-setting', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ notifications_enabled: nextState }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'Gagal memperbarui pengaturan notifikasi.');
        setShowNotificationConfirm(false);
        return;
      }

      setNotificationsEnabled(nextState);
      if (currentUser) {
        const updated = { ...currentUser, notifications_enabled: nextState };
        setLocalUser(updated);
        onUserUpdate?.(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('jabarpleasure_notifications_enabled', String(nextState));
        window.dispatchEvent(new Event(NOTIFICATION_EVENT));
      }
      setShowNotificationConfirm(false);
      showToast(
        nextState
          ? 'Notifikasi perjalanan berhasil diaktifkan.'
          : 'Notifikasi perjalanan telah dinonaktifkan.'
      );
    } catch {
      showToast('Terjadi kesalahan jaringan saat memperbarui notifikasi.');
      setShowNotificationConfirm(false);
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}>
      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[420px] bg-gray-900/90 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs backdrop-blur-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#60CE9F] shrink-0" />
          <span className="flex-1">{toastMsg}</span>
        </div>
      )}

      {/* 1. App Header with Brand Logo, Bell Badge, and Wishlist Button with Red Badge */}
      <AppHeader
        wishlistCount={isLoading ? 0 : effectiveWishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick || onNavigateToWishlist}
        className="shrink-0"
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-5 pt-4 pb-6 min-h-0 select-none">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
            Profil
          </h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Tentang kamu dan perjalanan berikutnya
          </p>
        </div>

        {isLoading ? (
          /* SKELETON SCREEN SAAT DATA USER SEDANG DIMUAT */
          <div className="mt-4 space-y-5">
            {/* User Profile Card Skeleton */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4.5 bg-gray-200 rounded-md w-36" />
                    <div className="h-3 bg-gray-200 rounded-md w-44" />
                    <div className="h-3 bg-gray-200 rounded-md w-28" />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
              </div>

              <div className="border-t border-gray-100 my-4" />

              <div className="grid grid-cols-3 text-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-5 bg-gray-200 rounded w-8" />
                  <div className="h-3 bg-gray-200 rounded w-14" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-5 bg-gray-200 rounded w-8" />
                  <div className="h-3 bg-gray-200 rounded w-14" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-5 bg-gray-200 rounded w-8" />
                  <div className="h-3 bg-gray-200 rounded w-14" />
                </div>
              </div>
            </div>

            {/* Section: Akun & Preferensi Skeleton */}
            <section aria-label="Akun dan Preferensi">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2.5 animate-pulse" />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] divide-y divide-gray-50 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-gray-200 rounded w-28" />
                        <div className="h-2.5 bg-gray-200 rounded w-44" />
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-gray-100 rounded-md" />
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Bantuan Skeleton */}
            <section aria-label="Bantuan">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2.5 animate-pulse" />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="flex items-center justify-between p-3.5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-24" />
                      <div className="h-2.5 bg-gray-200 rounded w-40" />
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-gray-100 rounded-md" />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <>
            {/* 2. User Profile Card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  {/* Avatar: Photo if available, or Initials */}
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#EEF2FF] text-[#4941EC] font-bold text-xl flex items-center justify-center shrink-0 border border-indigo-100 shadow-xs">
                    {currentUser?.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={currentUser.avatar_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      displayInitials
                    )}
                  </div>

                  {/* User Details */}
                  <div>
                    <h2 className="font-bold text-[16px] text-gray-900 leading-snug">
                      {displayName}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {displayEmail}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {displayCity}
                    </p>
                  </div>
                </div>

                {/* Edit Profile Button (Pencil) */}
                <button
                  type="button"
                  onClick={() => {
                    onEditProfile?.();
                    setIsEditProfileOpen(true);
                  }}
                  aria-label="Edit Profil"
                  className="w-9 h-9 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4941EC] flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
                >
                  <Pencil className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4" />

              {/* 3-Column Statistics */}
              <div className="grid grid-cols-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-[20px] text-[#4941EC] leading-tight">
                    {tripsCount}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    Perjalanan
                  </span>
                </div>

                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={onNavigateToWishlist}
                >
                  <span className="font-bold text-[20px] text-[#4941EC] leading-tight group-hover:scale-105 transition-transform">
                    {effectiveWishlistCount}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 group-hover:text-[#4941EC] transition-colors">
                    Wishlist
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-bold text-[20px] text-[#4941EC] leading-tight">
                    {itineraryCount}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    Rencana
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Section: Akun & Preferensi */}
            <section aria-label="Akun dan Preferensi" className="mt-6">
              <h2 className="font-bold text-[14px] text-gray-900 mb-2.5">
                Akun & preferensi
              </h2>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] divide-y divide-gray-50 overflow-hidden">
                {/* Item 1: Informasi pribadi (Opens Edit Profile) */}
                <button
                  type="button"
                  onClick={() => {
                    onItemClick?.('Informasi pribadi');
                    setIsEditProfileOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50/80 active:bg-gray-100/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-gray-900 leading-snug">
                        Informasi pribadi
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Nama, email, dan nomor telepon
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>

                {/* Item 2: Preferensi perjalanan (Opens Travel Preferences) */}
                <button
                  type="button"
                  onClick={() => {
                    onItemClick?.('Preferensi perjalanan');
                    setIsTravelPrefsOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50/80 active:bg-gray-100/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-gray-900 leading-snug">
                        Preferensi perjalanan
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Minat wisata dan gaya perjalanan
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>

                {/* Item 3: Notifikasi (Interactive Toggle with Centered Modal Confirmation) */}
                <div
                  onClick={() => setShowNotificationConfirm(true)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50/80 active:bg-gray-100/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-gray-900 leading-snug">
                        Notifikasi
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Pengingat trip dan rekomendasi
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch Component: Gray for Nonaktif (left), Blue for Aktif (right) */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        notificationsEnabled ? 'text-[#4941EC]' : 'text-gray-400'
                      }`}
                    >
                      {notificationsEnabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <div
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        notificationsEnabled ? 'bg-[#4941EC]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Item 4: Privasi dan keamanan (Opens Privacy & Security) */}
                <button
                  type="button"
                  onClick={() => {
                    onItemClick?.('Privasi dan keamanan');
                    setIsPrivacySecurityOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50/80 active:bg-gray-100/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-gray-900 leading-snug">
                        Privasi dan keamanan
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Kata sandi dan izin lokasi
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              </div>
            </section>

            {/* 4. Section: Bantuan (Opens Help Center) */}
            <section aria-label="Bantuan" className="mt-5">
              <h2 className="font-bold text-[14px] text-gray-900 mb-2.5">
                Bantuan
              </h2>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    onItemClick?.('Pusat bantuan');
                    setIsHelpCenterOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50/80 active:bg-gray-100/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-gray-900 leading-snug">
                        Pusat bantuan
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Pertanyaan umum dan hubungi kami
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              </div>
            </section>
          </>
        )}

        {/* 5. Logout Button */}
        {!isLoading && (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-white border border-red-200/90 hover:bg-red-50/50 active:scale-[0.98] text-[#EF4444] rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold text-xs mt-5 shadow-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.2] text-[#EF4444]" />
            <span>Keluar akun</span>
          </button>
        )}

        {/* 6. Version Footer */}
        <p className="text-center text-[11px] text-gray-400 mt-4 mb-2">
          Versi aplikasi 1.0.0
        </p>
      </main>

      {/* Centered Notification Toggle Confirmation Modal */}
      {showNotificationConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setShowNotificationConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-gray-100 z-10">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-3.5 ${
                notificationsEnabled
                  ? 'bg-amber-50 text-amber-500'
                  : 'bg-[#EEF2FF] text-[#4941EC]'
              }`}
            >
              {notificationsEnabled ? (
                <BellOff className="w-7 h-7 stroke-[2.2]" />
              ) : (
                <Bell className="w-7 h-7 stroke-[2.2]" />
              )}
            </div>

            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              {notificationsEnabled ? 'Nonaktifkan Notifikasi?' : 'Aktifkan Notifikasi?'}
            </h2>

            <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed max-w-[260px]">
              {notificationsEnabled
                ? 'Apakah Anda yakin ingin menonaktifkan notifikasi? Anda mungkin melewatkan pengingat perjalanan dan info rekomendasi terkini.'
                : 'Aktifkan notifikasi untuk menerima rekomendasi destinasi terdekat dan pengingat rute perjalanan Anda secara real-time.'}
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleConfirmToggleNotification}
                className={`w-full py-3 px-4 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-[0.98] ${
                  notificationsEnabled
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                    : 'bg-[#4941EC] hover:bg-indigo-700 shadow-indigo-500/20'
                }`}
              >
                {notificationsEnabled ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
              </button>

              <button
                type="button"
                onClick={() => setShowNotificationConfirm(false)}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Pop-up Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-gray-100 z-10">
            <div className="w-14 h-14 rounded-full bg-red-50 text-[#EF4444] flex items-center justify-center mb-3.5">
              <LogOut className="w-7 h-7 stroke-[2.2]" />
            </div>

            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Konfirmasi Keluar Akun
            </h2>

            <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed max-w-[260px]">
              Apakah Anda benar-benar ingin keluar dari akun JabarPleasure?
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout?.();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#EF4444] hover:bg-red-600 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                Ya, Keluar
              </button>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Modals */}
      {isEditProfileOpen && (
        <EditProfileBottomSheet
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={currentUser}
          onSuccess={handleProfileUpdateSuccess}
          onErrorToast={showToast}
        />
      )}

      {isTravelPrefsOpen && (
        <TravelPreferencesModal
          isOpen={isTravelPrefsOpen}
          onClose={() => setIsTravelPrefsOpen(false)}
          currentPreferences={currentUser?.preferences}
          currentTravelStyle={currentUser?.travel_style}
          onSuccess={handlePreferencesSuccess}
        />
      )}

      {isPrivacySecurityOpen && (
        <PrivacySecurityModal
          isOpen={isPrivacySecurityOpen}
          onClose={() => setIsPrivacySecurityOpen(false)}
          initialLocationPermission={currentUser?.location_permission_enabled ?? true}
          onLocationPermissionChange={(enabled) => {
            if (currentUser) {
              const updated = { ...currentUser, location_permission_enabled: enabled };
              setLocalUser(updated);
              onUserUpdate?.(updated);
            }
          }}
          onSuccessToast={showToast}
        />
      )}

      {isHelpCenterOpen && (
        <HelpCenterModal
          isOpen={isHelpCenterOpen}
          onClose={() => setIsHelpCenterOpen(false)}
        />
      )}

      {/* 7. Fixed Bottom Navigation Bar */}
      <div className="shrink-0 w-full z-30">
        <BottomNav
          activeTab="profil"
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}
