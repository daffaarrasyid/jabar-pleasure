'use client';

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import SearchBar from '@/components/home/SearchBar';
import CategoryFilter from '@/components/home/CategoryFilter';
import { Star, ArrowLeft } from 'lucide-react';
import { getDestinations, ApiDestination } from '@/lib/api';

export interface TopDestinationItem {
  id: string | number;
  name: string;
  category: string;
  rating: number;
  distance: string;
  regency: string;
  image: string;
  slug?: string;
}

interface TopDestinationsViewProps {
  onBack?: () => void;
  onNavigateToMap?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onProfileClick?: () => void;
  onNavigateToRiwayat?: () => void;
  onItemClick?: (item: TopDestinationItem) => void;
  favoritBadgeCount?: number;
  selectedCategory?: string;
  initialQuery?: string;
  className?: string;
}

const FALLBACK_TOP_IMAGES = [
  '/gunung-malabar.jpg',
  '/tangkuban-parahu.jpg',
  '/gedung-sate.jpg',
  '/floating-market.jpg',
  '/ranca-upas.jpg',
  '/tahura-juanda.jpg',
];

export default function TopDestinationsView({
  onBack,
  onNavigateToMap,
  onNotificationClick,
  onWishlistClick,
  onProfileClick,
  onNavigateToRiwayat,
  onItemClick,
  favoritBadgeCount = 0,
  selectedCategory: initialCategory = 'Semua',
  initialQuery = '',
  className = '',
}: TopDestinationsViewProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [destinations, setDestinations] = useState<TopDestinationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTabId>('beranda');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getDestinations({
      category: selectedCategory !== 'Semua' ? selectedCategory : undefined,
      search: searchQuery.trim() || undefined,
      per_page: 12,
    })
      .then((res) => {
        if (!isMounted) return;
        const items = res.data || [];

        const mapped: TopDestinationItem[] = items.map((dest: ApiDestination, idx: number) => {
          const fallbackImg = FALLBACK_TOP_IMAGES[idx % FALLBACK_TOP_IMAGES.length];
          const distStr = dest.distance_km ? `${dest.distance_km} km` : '4.5 km';

          return {
            id: dest.id,
            name: dest.name,
            category: dest.category?.name || 'Wisata',
            rating: 4.8,
            distance: distStr,
            regency: dest.regency?.name || 'Jawa Barat',
            image: dest.cover_image_url || fallbackImg,
            slug: dest.slug,
          };
        });

        setDestinations(mapped);
      })
      .catch((err) => {
        console.warn('Failed to load top destinations:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  const handleTabChange = (tab: NavTabId) => {
    setActiveTab(tab);
    if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onProfileClick?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}>
      {/* Top Header */}
      <AppHeader
        unreadNotifications={2}
        wishlistCount={favoritBadgeCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick || onProfileClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
        {/* Back Button & Title Header */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-xs cursor-pointer active:scale-95 transition-all"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              Semua Destinasi Wisata
            </h1>
            <p className="text-xs text-gray-500">
              {destinations.length > 0 ? `${destinations.length} destinasi ditemukan` : 'Eksplorasi destinasi Jawa Barat'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Cari nama destinasi atau kota..."
          onFilterClick={() => {}}
        />

        {/* Category Carousel Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 2-Card Row Grid */}
        <div className="px-5 py-3">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3.5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-[4/3] bg-gray-200" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : destinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100 p-6 mt-2">
              <p className="text-sm font-semibold text-gray-800">
                Tidak ada destinasi yang ditemukan
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-[260px]">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {destinations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onItemClick?.(item)}
                  className="min-w-0 group flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border border-gray-100 shadow-xs"
                >
                  {/* Card Image */}
                  <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/gunung-malabar.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Badges & Meta Row */}
                  <div className="p-2.5 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#4941EC] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[95px]">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-[#EDAD40] text-[#EDAD40]" />
                        <span className="text-xs font-bold text-gray-800">
                          {item.rating}
                        </span>
                      </div>
                    </div>

                    {/* Destination Title */}
                    <h3 className="text-sm font-bold text-gray-900 truncate mt-0.5 group-hover:text-[#4941EC] transition-colors" title={item.name}>
                      {item.name}
                    </h3>

                    {/* Distance & Location */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                      <span className="truncate">{item.regency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-30">
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}
