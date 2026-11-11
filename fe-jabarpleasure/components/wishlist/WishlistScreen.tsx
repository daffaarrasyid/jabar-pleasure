'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Calendar, Navigation, Users, Trash2, Compass } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { getWishlists, deleteWishlist, ApiWishlist } from '@/lib/api';
import { getCategoryMeta } from '@/lib/categoryMeta';
import { DestinationDetailData } from '@/components/ui/DestinationDetailModal';

export interface WishlistItem {
  id: string | number;
  destination_id: number;
  name: string;
  category: string;
  location: string;
  statusTag: string;
  image: string;
  visitorsCount?: number;
  rawDestination?: Record<string, unknown>;
}

interface WishlistScreenProps {
  onBack?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToRencana?: () => void;
  onNavigateToRiwayat?: () => void;
  onCreateItinerary?: () => void;
  onItemClick?: (item: DestinationDetailData) => void;
  wishlistCount?: number;
  activeTab?: NavTabId;
  className?: string;
}

export default function WishlistScreen({
  onBack,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRencana,
  onNavigateToRiwayat,
  onCreateItinerary,
  onItemClick,
  wishlistCount: initialWishlistCount,
  activeTab,
  className = '',
}: WishlistScreenProps) {
  const [wishlists, setWishlists] = useState<ApiWishlist[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('jp_cached_wishlists');
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('jp_cached_wishlists');
    }
    return true;
  });

  // Fetch real wishlist data from database on mount (SWR)
  useEffect(() => {
    let isMounted = true;

    getWishlists()
      .then((data) => {
        if (!isMounted) return;
        setWishlists(data || []);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('jp_cached_wishlists', JSON.stringify(data || []));
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch wishlists:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveItem = async (e: React.MouseEvent, destId: number) => {
    e.stopPropagation();
    try {
      await deleteWishlist(destId);
      setWishlists((prev) => prev.filter((item) => item.destination_id !== destId));

      // Sync localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('jabarpleasure_wishlist_ids');
        if (stored) {
          const ids: Array<number | string> = JSON.parse(stored);
          const updated = ids.filter((id) => id !== destId);
          localStorage.setItem('jabarpleasure_wishlist_ids', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn('Failed to remove wishlist item:', err);
    }
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onNavigateToProfile?.();
    } else if (tab === 'rencana') {
      onNavigateToRencana?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    }
  };

  const totalCount = wishlists.length;

  return (
    <div className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}>
      {/* 1. App Header */}
      <AppHeader
        wishlistCount={totalCount || initialWishlistCount || 0}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-5 pt-2 pb-6 min-h-0 select-none no-scrollbar">
        {/* Title with Back Button on Left & Subtitle */}
        <div className="mt-1">
          <div className="flex items-center gap-2 -ml-1 mb-1">
            <button
              type="button"
              onClick={onBack || onNavigateToHome}
              aria-label="Kembali"
              className="p-1.5 text-gray-800 hover:text-gray-900 transition-colors active:scale-95 rounded-full hover:bg-gray-100 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.4]" />
            </button>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
              Wishlist Perjalanan
            </h1>
          </div>
          <p className="text-xs text-gray-500 pl-0.5 leading-relaxed">
            Destinasi yang kamu simpan untuk dibawa ke itinerary perjalananmu.
          </p>
        </div>

        {/* Info Card: Gunakan wishlist sebagai keranjang destinasi */}
        <section
          aria-label="Panduan Wishlist"
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mt-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4941EC] shrink-0 mt-0.5">
              <Heart className="w-5 h-5 text-[#4941EC] stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-[14px] text-gray-900 leading-snug">
                Gunakan wishlist sebagai keranjang destinasi
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Pilih destinasi yang sudah kamu simpan, lalu masukkan ke itinerary untuk menyusun rencana perjalananmu.
              </p>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-2 mt-3.5 flex-wrap">
            <span className="px-3 py-1 bg-[#EEF2FF] text-[#4941EC] font-semibold text-[11px] rounded-full">
              {isLoading ? 'Memuat wishlist...' : `${totalCount} destinasi tersimpan`}
            </span>
          </div>
        </section>

        {/* Section: Destinasi Tersimpan */}
        <section aria-label="Destinasi Tersimpan" className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[15px] text-gray-900">
              Destinasi Tersimpan
            </h2>
            <span className="font-semibold text-xs text-[#4941EC]">
              {isLoading ? '...' : `${totalCount} item`}
            </span>
          </div>

          {/* SKELETON SCREEN SAAT DATA SEDANG DIMUAT */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col p-0 animate-pulse shadow-xs"
                >
                  <div className="w-full h-[105px] bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : totalCount === 0 ? (
            /* EMPTY STATE KETIKA BELUM ADA WISHLIST */
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs flex flex-col items-center justify-center text-center my-3">
              <div className="w-16 h-16 rounded-full bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center mb-3.5 shadow-xs">
                <Compass className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Belum ada destinasi favorit
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 max-w-[260px] leading-relaxed">
                Jelajahi halaman beranda dan tambahkan destinasi wisata menarik ke dalam wishlist Anda!
              </p>
              <button
                type="button"
                onClick={onNavigateToHome}
                className="mt-5 px-5 py-2.5 bg-[#4941EC] hover:bg-[#3C35C7] text-white text-xs font-bold rounded-xl shadow-md shadow-[#4941EC]/20 transition-all active:scale-95 cursor-pointer"
              >
                Jelajahi Destinasi Sekarang
              </button>
            </div>
          ) : (
            /* REAL DATA CARDS */
            <div className="grid grid-cols-2 gap-3">
              {wishlists.map((w, idx) => {
                const dest = w.destination;
                if (!dest) return null;

                const meta = getCategoryMeta(dest.category?.name, idx);
                const CategoryIcon = meta.icon;
                const distStr = dest.regency?.name || 'Jawa Barat';
                const visitors = dest.check_ins_count ?? 0;

                return (
                  <div
                    key={w.id}
                    onClick={() =>
                      onItemClick?.({
                        id: dest.id,
                        name: dest.name,
                        slug: dest.slug,
                        category: dest.category?.name || 'Wisata',
                        distance: distStr,
                        image: dest.cover_image_url || meta.fallbackImage,
                        regency: dest.regency?.name || 'Jawa Barat',
                        visitCount: visitors,
                      })
                    }
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all active:scale-[0.98] relative"
                  >
                    {/* Image */}
                    <div className="relative w-full h-[105px] bg-gray-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dest.cover_image_url || meta.fallbackImage}
                        alt={dest.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = meta.fallbackImage;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Remove Button on card */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveItem(e, dest.id)}
                        aria-label={`Hapus ${dest.name} dari wishlist`}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category & Visitor Count */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] bg-[#EEF2FF] text-[#4941EC] truncate max-w-[85px]">
                            <CategoryIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{dest.category?.name || 'Wisata'}</span>
                          </span>
                          <div className="flex items-center gap-1 shrink-0 text-gray-600">
                            <Users className="w-3 h-3 text-[#4941EC]" />
                            <span className="text-[10px] font-semibold text-gray-700">
                              {visitors > 0 ? visitors.toLocaleString('id-ID') : '0'}
                            </span>
                          </div>
                        </div>

                        {/* Name */}
                        <h3 className="font-bold text-[13px] text-gray-900 leading-snug line-clamp-1 group-hover:text-[#4941EC] transition-colors" title={dest.name}>
                          {dest.name}
                        </h3>

                        {/* Distance / Location */}
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          {distStr}
                        </p>
                      </div>

                      {/* Status Indicator Tag */}
                      <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-medium text-[#10B981]">
                        <Navigation className="w-3 h-3 text-[#10B981] fill-[#10B981] rotate-45 shrink-0" />
                        <span className="line-clamp-1">Siap masuk itinerary</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. Action Card: Buat itinerary dari wishlist (jika ada wishlist) */}
        {totalCount > 0 && (
          <section
            aria-label="Buat Itinerary"
            className="bg-[#4941EC] rounded-2xl p-4 text-white shadow-xl shadow-[#4941EC]/30 mt-6 mb-2"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4941EC] shrink-0 mt-0.5">
                <Calendar className="w-5 h-5 text-[#4941EC]" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-[15px] text-white leading-snug">
                  Buat itinerary dari wishlist
                </h2>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  Pilih destinasi yang sudah kamu simpan, lalu susun jadwal perjalananmu dengan lebih cepat.
                </p>
              </div>
            </div>

            {/* Action Pills */}
            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
              <span className="px-3 py-1 bg-white text-[#4941EC] font-bold text-[11px] rounded-full shadow-xs">
                {totalCount} destinasi siap dipilih
              </span>
            </div>

            {/* Full-width Call to Action Button */}
            <button
              type="button"
              onClick={onCreateItinerary || onNavigateToRencana}
              className="w-full bg-white text-[#4941EC] hover:bg-gray-50 active:scale-[0.98] transition-all font-bold text-sm py-3 rounded-xl mt-4 text-center cursor-pointer shadow-md"
            >
              Buat Itinerary Sekarang
            </button>
          </section>
        )}
      </main>

      {/* 3. Fixed Bottom Navigation Bar */}
      <div className="shrink-0 w-full z-30">
        <BottomNav
          activeTab={activeTab || 'beranda'}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}
