'use client';

import React, { useState } from 'react';
import {
  Pencil,
  User,
  SlidersHorizontal,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';

export interface UserProfileData {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  avatar_url?: string | null;
  initials?: string;
  role?: string;
  statistics?: {
    trips_count?: number;
    wishlist_count?: number;
    itinerary_count?: number;
  };
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
  wishlistCount = 0,
  className = '',
}: ProfileScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayName = user?.name || 'Pengguna JabarPleasure';
  const displayEmail = user?.email || '';
  const displayCity = user?.city || 'Jawa Barat, Indonesia';
  const displayInitials =
    user?.initials ||
    (displayName !== 'Pengguna JabarPleasure'
      ? displayName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'JP');
  const tripsCount = user?.statistics?.trips_count ?? 0;
  const effectiveWishlistCount = user?.statistics?.wishlist_count ?? wishlistCount;
  const itineraryCount = user?.statistics?.itinerary_count ?? 0;
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

  return (
    <div className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}>
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
                  {/* Initials Avatar Skeleton */}
                  <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />

                  {/* User Details Skeleton */}
                  <div className="space-y-2">
                    <div className="h-4.5 bg-gray-200 rounded-md w-36" />
                    <div className="h-3 bg-gray-200 rounded-md w-44" />
                    <div className="h-3 bg-gray-200 rounded-md w-28" />
                  </div>
                </div>

                {/* Edit Profile Button Placeholder */}
                <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4" />

              {/* 3-Column Statistics Skeleton */}
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
              {/* Initials Avatar */}
              <div className="w-14 h-14 rounded-full bg-[#EEF2FF] text-[#4941EC] font-bold text-xl flex items-center justify-center shrink-0">
                {displayInitials}
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

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={onEditProfile}
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
            {/* Item 1: Informasi pribadi */}
            <button
              type="button"
              onClick={() => onItemClick?.('Informasi pribadi')}
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

            {/* Item 2: Preferensi perjalanan */}
            <button
              type="button"
              onClick={() => onItemClick?.('Preferensi perjalanan')}
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

            {/* Item 3: Notifikasi */}
            <button
              type="button"
              onClick={() => onItemClick?.('Notifikasi')}
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
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#4941EC]">
                  Aktif
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </button>

            {/* Item 4: Privasi dan keamanan */}
            <button
              type="button"
              onClick={() => onItemClick?.('Privasi dan keamanan')}
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

        {/* 4. Section: Bantuan */}
        <section aria-label="Bantuan" className="mt-5">
          <h2 className="font-bold text-[14px] text-gray-900 mb-2.5">
            Bantuan
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
            <button
              type="button"
              onClick={() => onItemClick?.('Pusat bantuan')}
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
              apakah ingin benar-benar logout akun?
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
