'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Heart, Calendar, Navigation } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';

export interface WishlistItem {
  id: string;
  name: string;
  category: 'Alam' | 'Modern' | 'Sejarah' | 'Populer' | string;
  rating: number;
  location: string;
  statusTag: string;
  image: string;
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
  onItemClick?: (item: WishlistItem) => void;
  wishlistCount?: number;
  activeTab?: NavTabId;
  className?: string;
}

const SAVED_DESTINATIONS: WishlistItem[] = [
  {
    id: 'tangkuban-parahu-1',
    name: 'Tangkuban Parahu',
    category: 'Alam',
    rating: 4.8,
    location: '24.5 km - Subang',
    statusTag: 'Siap masuk itinerary',
    image: '/tangkuban-parahu.jpg',
  },
  {
    id: 'tahura-juanda-1',
    name: 'Taman Hutan Raya Juanda',
    category: 'Alam',
    rating: 4.8,
    location: 'Dago Pakar, Ciburial',
    statusTag: 'Cocok untuk pagi hari',
    image: '/tahura-juanda.jpg',
  },
  {
    id: 'floating-market-1',
    name: 'Floating Market Lembang',
    category: 'Modern',
    rating: 4.6,
    location: 'Lembang, Bandung Barat',
    statusTag: 'Cocok untuk siang hari',
    image: '/tangkuban-parahu.jpg',
  },
  {
    id: 'gedung-sate-1',
    name: 'Gedung Sate',
    category: 'Sejarah',
    rating: 4.7,
    location: 'Bandung, Jawa Barat',
    statusTag: 'Cocok untuk sore hari',
    image: '/kebun-raya-bogor.jpg',
  },
];

const POPULAR_RECOMMENDATIONS: WishlistItem[] = [
  {
    id: 'ciwidey-valley-1',
    name: 'Ciwidey Valley Resort',
    category: 'Populer',
    rating: 4.9,
    location: 'Ciwidey, Bandung',
    statusTag: '12.8 km dari kamu',
    image: '/tangkuban-parahu.jpg',
  },
  {
    id: 'dusun-bambu-1',
    name: 'Dusun Bambu',
    category: 'Populer',
    rating: 4.8,
    location: 'Cisarua, Bandung Barat',
    statusTag: '18.4 km dari kamu',
    image: '/kebun-raya-bogor.jpg',
  },
];

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
  wishlistCount = 4,
  activeTab,
  className = '',
}: WishlistScreenProps) {
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

  return (
    <div className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}>
      {/* 1. App Header with Brand Logo, Bell Badge, and Wishlist Love Button with Red Badge */}
      <AppHeader
        unreadNotifications={2}
        wishlistCount={wishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-5 pt-2 pb-6 min-h-0 select-none">
        {/* Title with Back Button on Left & Subtitle */}
        <div className="mt-1">
          <div className="flex items-center gap-2 -ml-1 mb-1">
            <button
              type="button"
              onClick={onBack}
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
              4 destinasi tersimpan
            </span>
            <span className="px-3 py-1 bg-[#DCFCE7] text-[#059669] font-semibold text-[11px] rounded-full">
              2 rekomendasi populer
            </span>
          </div>
        </section>

        {/* Section 1: Destinasi Tersimpan */}
        <section aria-label="Destinasi Tersimpan" className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[15px] text-gray-900">
              Destinasi Tersimpan
            </h2>
            <span className="font-semibold text-xs text-[#4941EC]">
              4 item
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SAVED_DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                onClick={() => onItemClick?.(dest)}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
              >
                {/* Image */}
                <div className="relative w-full h-[105px] bg-gray-100 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 480px) 50vw, 240px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-[#EEF2FF] text-[#4941EC]">
                        {dest.category}
                      </span>
                      <span className="font-bold text-xs text-gray-700">
                        {dest.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-[13px] text-gray-900 leading-snug line-clamp-1">
                      {dest.name}
                    </h3>

                    {/* Distance / Location */}
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                      {dest.location}
                    </p>
                  </div>

                  {/* Status Indicator Tag */}
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-medium text-[#10B981]">
                    <Navigation className="w-3 h-3 text-[#10B981] fill-[#10B981] rotate-45 shrink-0" />
                    <span className="line-clamp-1">{dest.statusTag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Rekomendasi Populer */}
        <section aria-label="Rekomendasi Populer" className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[15px] text-gray-900">
              Rekomendasi Populer
            </h2>
            <span className="text-[11px] text-gray-400 font-normal">
              Dari kunjungan pengguna
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {POPULAR_RECOMMENDATIONS.map((dest) => (
              <div
                key={dest.id}
                onClick={() => onItemClick?.(dest)}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
              >
                {/* Image */}
                <div className="relative w-full h-[105px] bg-gray-100 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 480px) 50vw, 240px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-[#DCFCE7] text-[#059669]">
                        {dest.category}
                      </span>
                      <span className="font-bold text-xs text-gray-700">
                        {dest.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-[13px] text-gray-900 leading-snug line-clamp-1">
                      {dest.name}
                    </h3>

                    {/* Distance / Location */}
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                      {dest.location}
                    </p>
                  </div>

                  {/* Status Indicator Tag */}
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-medium text-[#10B981]">
                    <Navigation className="w-3 h-3 text-[#10B981] fill-[#10B981] rotate-45 shrink-0" />
                    <span className="line-clamp-1">{dest.statusTag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Action Card: Buat itinerary dari wishlist */}
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
              4 destinasi siap dipilih
            </span>
            <span className="px-3 py-1 bg-white/20 text-white font-medium text-[11px] rounded-full backdrop-blur-xs">
              2 rekomendasi populer
            </span>
          </div>

          {/* Full-width Call to Action Button */}
          <button
            type="button"
            onClick={onCreateItinerary}
            className="w-full bg-white text-[#4941EC] hover:bg-gray-50 active:scale-[0.98] transition-all font-bold text-sm py-3 rounded-xl mt-4 text-center cursor-pointer shadow-md"
          >
            Buat Itinerary Sekarang
          </button>
        </section>
      </main>

      {/* 3. Fixed Bottom Navigation Bar */}
      <div className="shrink-0 w-full z-30">
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}
