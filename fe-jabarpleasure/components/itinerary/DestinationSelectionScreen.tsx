'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  CheckCircle2,
  Heart,
  MapPin,
  Users,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';

export interface DestinationOption {
  id: string;
  name: string;
  category: string;
  distanceFromStart: string;
  distanceKm: number;
  inWishlist: boolean;
  tag: string;
  description: string;
  visitsMonth?: string;
  popularityTag?: string;
  image: string;
}

interface DestinationSelectionScreenProps {
  originName?: string;
  onBack?: () => void;
  onChangeOrigin?: () => void;
  onFinishSelection?: (destinations: DestinationOption[]) => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToRiwayat?: () => void;
  wishlistCount?: number;
  initialMode?: 'wishlist' | 'popular';
  className?: string;
}

const ALL_DESTINATIONS: DestinationOption[] = [
  {
    id: 'tugu-kujang',
    name: 'Tugu Kujang',
    category: 'Landmark',
    distanceFromStart: '2,7 km dari titik awal',
    distanceKm: 2.7,
    inWishlist: true,
    tag: 'Di wishlist',
    description: 'Ikon Kota Bogor untuk memulai petualanganmu.',
    visitsMonth: '980 kunjungan bulan ini',
    popularityTag: 'Populer di Bogor',
    image: '/tugu-kujang.jpg',
  },
  {
    id: 'kebun-raya',
    name: 'Kebun Raya Bogor',
    category: 'Wisata alam',
    distanceFromStart: '1,8 km dari titik awal',
    distanceKm: 1.8,
    inWishlist: true,
    tag: 'Paling dekat',
    description: 'Jalan santai di tengah rindangnya kebun raya.',
    visitsMonth: '1,2 rb kunjungan bulan ini',
    popularityTag: 'Favorit wisatawan',
    image: '/kebun-raya-bogor.jpg',
  },
  {
    id: 'botani-square',
    name: 'Botani Square (Botas)',
    category: 'Belanja & kuliner',
    distanceFromStart: '3,1 km dari titik awal',
    distanceKm: 3.1,
    inWishlist: true,
    tag: 'Sering dikunjungi',
    description: 'Pilihan untuk makan, belanja, dan bersantai.',
    visitsMonth: '860 kunjungan bulan ini',
    popularityTag: 'Favorit untuk kuliner',
    image: '/botani-square.jpg',
  },
];

export default function DestinationSelectionScreen({
  originName = 'Stasiun Bogor',
  onBack,
  onChangeOrigin,
  onFinishSelection,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRiwayat,
  wishlistCount = 3,
  initialMode = 'wishlist',
  className = '',
}: DestinationSelectionScreenProps) {
  // State 1: Filter mode ('wishlist' matches Image 1, 'popular' matches Image 2)
  const [viewSource, setViewSource] = useState<'wishlist' | 'popular'>(initialMode);

  // State 2: Selected route destinations (when >0, morphs into Image 3 "Mau ke mana lagi?")
  const [selectedDestinations, setSelectedDestinations] = useState<DestinationOption[]>([]);

  // State 3: Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle or add item to route
  const handleAddDestination = (dest: DestinationOption) => {
    if (!selectedDestinations.some((d) => d.id === dest.id)) {
      setSelectedDestinations((prev) => [...prev, dest]);
    }
  };

  const handleRemoveDestination = (destId: string) => {
    setSelectedDestinations((prev) => prev.filter((d) => d.id !== destId));
  };

  // Filtered available destinations (exclude already selected ones)
  const availableDestinations = useMemo(() => {
    return ALL_DESTINATIONS.filter((item) => {
      const isAlreadyAdded = selectedDestinations.some((d) => d.id === item.id);
      if (isAlreadyAdded) return false;

      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [selectedDestinations, searchQuery]);

  // Featured next-stop recommendation (for Image 3 "Mau ke mana lagi?")
  const lastAdded = selectedDestinations[selectedDestinations.length - 1];
  const nextRecommendation = useMemo(() => {
    // If Tugu Kujang is added, recommend Botani Square (matches Image 3)
    if (lastAdded?.id === 'tugu-kujang') {
      return ALL_DESTINATIONS.find((d) => d.id === 'botani-square');
    }
    // Else recommend the first available destination
    return availableDestinations[0] || ALL_DESTINATIONS[0];
  }, [lastAdded, availableDestinations]);

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onNavigateToProfile?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    } else if (tab === 'rencana') {
      onBack?.();
    }
  };

  const isMauKemanaLagi = selectedDestinations.length > 0;

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. App Header with Brand Logo, Bell Badge & Wishlist Button */}
      <AppHeader
        unreadNotifications={2}
        wishlistCount={wishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-2 pb-28">
        {/* Top Header Row with Back Button */}
        <div className="flex items-start gap-2.5 mb-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              {isMauKemanaLagi ? 'Mau ke mana lagi?' : 'Pilih destinasi'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isMauKemanaLagi
                ? 'Lanjutkan rute dengan tempat seru berikutnya'
                : viewSource === 'wishlist'
                ? 'Mulai dari tempat yang ingin kamu kunjungi'
                : 'Temukan tempat seru di sekitar titik awal'}
            </p>
          </div>

          {/* Quick toggle between "Dengan Wishlist" (Image 1) and "Tanpa Wishlist" (Image 2) */}
          {!isMauKemanaLagi && (
            <button
              type="button"
              onClick={() =>
                setViewSource((prev) => (prev === 'wishlist' ? 'popular' : 'wishlist'))
              }
              className="text-[10px] text-gray-500 hover:text-[#4941EC] font-semibold bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs cursor-pointer shrink-0 mt-0.5 transition-colors"
              title="Ganti tampilan dengan/tanpa Wishlist"
            >
              Mode: {viewSource === 'wishlist' ? 'Wishlist' : 'Populer'}
            </button>
          )}
        </div>

        {/* Step Wizard Bar (Step 2: Destinasi is ACTIVE) */}
        <div className="flex flex-col gap-1.5 mb-3.5 select-none">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1 bg-[#4941EC] rounded-full" />
            <div className="h-1 bg-[#4941EC] rounded-full" />
            <div className="h-1 bg-[#E0E7FF] rounded-full" />
          </div>
          <div className="grid grid-cols-3 text-center">
            <span className="text-xs font-medium text-gray-400">
              Keberangkatan
            </span>
            <span className="text-xs font-bold text-[#4941EC]">
              Destinasi
            </span>
            <span className="text-xs font-medium text-gray-400">
              Ringkasan
            </span>
          </div>
        </div>

        {/* Context Chip: Berangkat dari ... Ubah (only in initial view) */}
        {!isMauKemanaLagi && (
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#4941EC] stroke-[2.2]" />
              <span>Berangkat dari {originName}</span>
            </div>
            <button
              type="button"
              onClick={onChangeOrigin || onBack}
              className="text-xs font-semibold text-[#4941EC] hover:underline cursor-pointer"
            >
              Ubah
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: "MAU KE MANA LAGI?" (Image 3) */}
        {/* ======================================================== */}
        {isMauKemanaLagi && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200 mb-4">
            {/* "Sudah masuk rute" Card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Sudah masuk rute
                </h3>
                <span className="bg-[#E6F8F0] text-[#10B981] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {selectedDestinations.length} destinasi
                </span>
              </div>

              {/* Added Destinations List */}
              <div className="flex flex-col gap-2.5">
                {selectedDestinations.map((dest, idx) => (
                  <div
                    key={dest.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl bg-gray-50/80 border border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={dest.image}
                          alt={dest.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {idx + 1}. {dest.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          Dari {originName} · {dest.distanceKm} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#4941EC] fill-[#4941EC]/15 stroke-[2.2]" />
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(dest.id)}
                        className="text-gray-300 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        title="Hapus dari rute"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Input for next stops */}
            <div className="relative flex items-center bg-white rounded-xl border border-gray-200 px-3.5 py-2.5 shadow-2xs focus-within:border-[#4941EC] focus-within:ring-2 focus-within:ring-[#4941EC]/15 transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari destinasi lain di Bogor"
                className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Callout: Terinspirasi perjalanan orang lain */}
            <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70">
              <Users className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#4941EC]">
                  Terinspirasi perjalanan orang lain
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Rekomendasi berikut mengikuti pola kunjungan wisatawan setelah tempat yang kamu pilih.
                </p>
              </div>
            </div>

            {/* Featured Next Recommendation Card (Big card matching Image 3) */}
            {nextRecommendation && !selectedDestinations.some((d) => d.id === nextRecommendation.id) && (
              <div className="bg-white rounded-2xl p-3.5 border-2 border-[#4941EC] shadow-sm flex flex-col gap-3">
                {/* Full-width landscape photo */}
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={nextRecommendation.image}
                    alt={nextRecommendation.name}
                    fill
                    className="object-cover"
                    sizes="440px"
                  />
                </div>

                {/* Title & Badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    {nextRecommendation.name}
                  </h3>
                  <span className="bg-[#E6F8F0] text-[#10B981] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                    Rekomendasi
                  </span>
                </div>

                {/* Recommendation explanation */}
                <div>
                  <p className="text-xs font-bold text-[#4941EC]">
                    Sering dikunjungi setelah {lastAdded?.name || 'titik sebelumnya'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Banyak wisatawan melanjutkan ke {nextRecommendation.name.split(' ')[0]} untuk makan dan bersantai. Sekitar 400 m dari {lastAdded?.name || 'lokasi sebelumnya'}.
                  </p>
                </div>

                {/* + Tambah ke rute Button */}
                <button
                  type="button"
                  onClick={() => handleAddDestination(nextRecommendation)}
                  className="w-full py-2.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tambah ke rute</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1 & 2: INITIAL "PILIH DESTINASI" */}
        {/* ======================================================== */}
        {!isMauKemanaLagi && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Search Input Box */}
            <div className="relative flex items-center bg-white rounded-xl border border-gray-200 px-3.5 py-2.5 shadow-2xs focus-within:border-[#4941EC] focus-within:ring-2 focus-within:ring-[#4941EC]/15 transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari destinasi di Bogor"
                className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Info Box: Dari wishlist kamu (Image 1) OR Wishlist kamu masih kosong (Image 2) */}
            {viewSource === 'wishlist' ? (
              <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70">
                <Heart className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#4941EC]">
                    Dari wishlist kamu
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    Tempat yang kamu simpan jadi prioritas rekomendasi. Kamu juga bisa mencari destinasi lain.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70">
                <Heart className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#4941EC]">
                    Wishlist kamu masih kosong
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    Kami pilihkan tempat dekat {originName} yang juga sering dikunjungi wisatawan.
                  </p>
                </div>
              </div>
            )}

            {/* Section Heading: "Ingin ke sini, kan? 3 tempat" OR "Dekat & sering dikunjungi" */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                {viewSource === 'wishlist' ? 'Ingin ke sini, kan?' : 'Dekat & sering dikunjungi'}
              </h3>
              {viewSource === 'wishlist' ? (
                <span className="text-xs font-semibold text-[#4941EC]">
                  {availableDestinations.length} tempat
                </span>
              ) : (
                <button
                  type="button"
                  className="text-gray-500 hover:text-[#4941EC] p-1 cursor-pointer transition-colors"
                  title="Filter destinasi"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Destination Cards List */}
            <div className="flex flex-col gap-3">
              {availableDestinations.map((dest) => {
                const isWishlistCard = viewSource === 'wishlist';

                return (
                  <div
                    key={dest.id}
                    className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-2 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Thumbnail photo */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={dest.image}
                            alt={dest.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        {/* Title, Badge, Distance */}
                        <div className="min-w-0">
                          <span className="bg-[#E6F8F0] text-[#10B981] text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block">
                            {isWishlistCard ? 'Di wishlist' : dest.tag}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">
                            {dest.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {isWishlistCard
                              ? `${dest.category} · ${dest.distanceFromStart}`
                              : `${dest.distanceKm} km · ${dest.category}`}
                          </p>
                        </div>
                      </div>

                      {/* Blue + Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddDestination(dest)}
                        aria-label={`Tambah ${dest.name} ke rute`}
                        className="w-8 h-8 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-all mt-1"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Description or Popularity line */}
                    <p className="text-xs text-gray-600 pl-0.5 leading-relaxed">
                      {isWishlistCard
                        ? dest.description
                        : `${dest.visitsMonth} · ${dest.popularityTag}`}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Guidance Card: Pilih destinasi pertamamu */}
            <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70 mt-1">
              <MapPin className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#4941EC]">
                  Pilih destinasi pertamamu
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  {viewSource === 'wishlist'
                    ? 'Ketuk + untuk memasukkan tempat ke rute.'
                    : 'Ketuk + atau cari tempat lain untuk membuat rute.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA when destinations are selected */}
        {isMauKemanaLagi && (
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-xs text-gray-500 text-center font-medium">
              {selectedDestinations.length} destinasi sudah masuk rute
            </p>
            <button
              type="button"
              onClick={() => onFinishSelection?.(selectedDestinations)}
              className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Selesai memilih</span>
            </button>
          </div>
        )}
      </main>

      {/* 3. Fixed Bottom Navigation Bar with Rencana active */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-30">
        <BottomNav
          activeTab="rencana"
          onTabChange={handleTabChange}
          badges={{
            favorit: wishlistCount,
          }}
        />
      </div>
    </div>
  );
}
