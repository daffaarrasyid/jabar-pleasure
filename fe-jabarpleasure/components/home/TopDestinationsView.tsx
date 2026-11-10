'use client';

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import SearchBar from '@/components/home/SearchBar';
import CategoryFilter from '@/components/home/CategoryFilter';
import { Users, ArrowLeft, Navigation, MapPin } from 'lucide-react';
import {
  getDestinations,
  getFeaturedDestinations,
  getNearbyDestinations,
  searchDestinations,
  ApiDestination,
} from '@/lib/api';
import { getCategoryMeta } from '@/lib/categoryMeta';

export type TopDestinationViewMode = 'featured' | 'nearby' | 'all';

export interface TopDestinationItem {
  id: string | number;
  name: string;
  category: string;
  visitorsCount?: number;
  distance: string;
  regency: string;
  image: string;
  slug?: string;
}

interface TopDestinationsViewProps {
  mode?: TopDestinationViewMode;
  userCoords?: { lat: number; lng: number } | null;
  activeLocationName?: string;
  onBack?: () => void;
  onNavigateToMap?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onProfileClick?: () => void;
  onNavigateToRiwayat?: () => void;
  onItemClick?: (item: any) => void;
  favoritBadgeCount?: number;
  selectedCategory?: string;
  initialQuery?: string;
  className?: string;
}

export default function TopDestinationsView({
  mode = 'all',
  userCoords,
  activeLocationName = 'Lokasi Terkini',
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

    const lat = userCoords?.lat ?? -6.9175;
    const lng = userCoords?.lng ?? 107.6191;
    const cat = selectedCategory !== 'Semua' ? selectedCategory : undefined;
    const search = searchQuery.trim();

    // 1. If user is actively searching with keyword
    if (search.length > 0) {
      searchDestinations(search, { category: cat, lat, lng })
        .then((items) => {
          if (!isMounted) return;
          const mapped: TopDestinationItem[] = items.slice(0, 10).map((dest: ApiDestination, idx: number) => {
            const meta = getCategoryMeta(dest.category?.name, idx);
            const distStr = dest.distance_km ? `${dest.distance_km} km` : 'Dekat Anda';
            const locStr = dest.regency?.name || 'Jawa Barat';

            return {
              id: dest.id,
              name: dest.name,
              category: dest.category?.name || 'Wisata',
              visitorsCount: dest.check_ins_count ?? 0,
              distance: distStr,
              regency: locStr,
              image: dest.cover_image_url || meta.fallbackImage,
              slug: dest.slug,
            };
          });
          setDestinations(mapped);
        })
        .catch((err) => {
          console.warn('Search error in full view:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }

    // 2. Mode 'featured': Top 10 Tempat Hiburan untuk Anda (berdasarkan preferensi & pengunjung terbanyak)
    if (mode === 'featured') {
      getFeaturedDestinations({ category: cat, lat, lng, limit: 10 })
        .then((items) => {
          if (!isMounted) return;
          const mapped: TopDestinationItem[] = items.slice(0, 10).map((dest: ApiDestination, idx: number) => {
            const meta = getCategoryMeta(dest.category?.name, idx);
            const distStr = dest.distance_km ? `${dest.distance_km} km` : 'Terdekat';
            const locStr = dest.regency?.name || 'Jawa Barat';

            return {
              id: dest.id,
              name: dest.name,
              category: dest.category?.name || 'Wisata',
              visitorsCount: dest.check_ins_count ?? 0,
              distance: distStr,
              regency: locStr,
              image: dest.cover_image_url || meta.fallbackImage,
              slug: dest.slug,
            };
          });
          setDestinations(mapped);
        })
        .catch((err) => {
          console.warn('Featured destinations error:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }

    // 3. Mode 'nearby': Top 10 Rekomendasi Terdekat (radius 25km dari yang terdekat)
    if (mode === 'nearby') {
      getNearbyDestinations({ category: cat, lat, lng, radius: 25.0, limit: 10 })
        .then((items) => {
          if (!isMounted) return;
          const mapped: TopDestinationItem[] = items.slice(0, 10).map((dest: ApiDestination, idx: number) => {
            const meta = getCategoryMeta(dest.category?.name, idx);
            const distStr = dest.distance_km ? `${dest.distance_km} km` : 'Dekat Anda';
            const locStr = dest.regency?.name || 'Jawa Barat';

            return {
              id: dest.id,
              name: dest.name,
              category: dest.category?.name || 'Wisata',
              visitorsCount: dest.check_ins_count ?? 0,
              distance: distStr,
              regency: locStr,
              image: dest.cover_image_url || meta.fallbackImage,
              slug: dest.slug,
            };
          });
          setDestinations(mapped);
        })
        .catch((err) => {
          console.warn('Nearby destinations error:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }

    // 4. Mode 'all': Default
    getDestinations({ category: cat, per_page: 10, lat, lng, sort_by: 'popular' })
      .then((res) => {
        if (!isMounted) return;
        const items = res.data || [];
        const mapped: TopDestinationItem[] = items.slice(0, 10).map((dest: ApiDestination, idx: number) => {
          const meta = getCategoryMeta(dest.category?.name, idx);
          const distStr = dest.distance_km ? `${dest.distance_km} km` : '4.5 km';
          const locStr = dest.regency?.name || 'Jawa Barat';

          return {
            id: dest.id,
            name: dest.name,
            category: dest.category?.name || 'Wisata',
            visitorsCount: dest.check_ins_count ?? 0,
            distance: distStr,
            regency: locStr,
            image: dest.cover_image_url || meta.fallbackImage,
            slug: dest.slug,
          };
        });
        setDestinations(mapped);
      })
      .catch((err) => {
        console.warn('Destinations error:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mode, selectedCategory, searchQuery, userCoords?.lat, userCoords?.lng]);

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

  const pageTitle =
    mode === 'featured'
      ? 'Tempat Hiburan untuk Anda'
      : mode === 'nearby'
      ? 'Rekomendasi Terdekat'
      : 'Semua Destinasi Wisata';

  const pageSubtitle =
    mode === 'featured'
      ? 'Top 10 destinasi pilihan berbasis minat & pengunjung terbanyak'
      : mode === 'nearby'
      ? `Top 10 destinasi terdekat dari ${activeLocationName} (radius 25 km)`
      : `${destinations.length} destinasi pilihan`;

  return (
    <div className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}>
      {/* Top Header */}
      <AppHeader
        wishlistCount={favoritBadgeCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick || onProfileClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-24 select-none">
        {/* Back Button & Title Header */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 tracking-tight truncate">
              {pageTitle}
            </h1>
            <p className="text-xs text-gray-500 truncate">
              {pageSubtitle}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Cari nama destinasi wisata..."
          filterBadgeCount={selectedCategory !== 'Semua' ? 1 : 0}
        />

        {/* Category Carousel Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Destination List (Top 10 Grid) */}
        <div className="px-5 py-3">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
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
              {destinations.map((item, idx) => {
                const meta = getCategoryMeta(item.category, idx);
                const CategoryIcon = meta.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      onItemClick?.({
                        id: item.id,
                        name: item.name,
                        slug: item.slug,
                        category: item.category,
                        distance: item.distance,
                        regency: item.regency,
                        image: item.image || meta.fallbackImage,
                        visitCount: item.visitorsCount,
                      })
                    }
                    className="min-w-0 group flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border border-gray-100 shadow-xs hover:shadow-md"
                  >
                    {/* Card Image */}
                    <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || meta.fallbackImage}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = meta.fallbackImage;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Badges & Meta Row */}
                    <div className="p-2.5 flex flex-col gap-1 min-w-0 flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 bg-[#EEF0FF] text-[#4941EC] text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[85px]">
                            <CategoryIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.category}</span>
                          </span>
                          <div className="flex items-center gap-1 shrink-0 text-gray-600">
                            <Users className="w-3 h-3 text-[#4941EC]" />
                            <span className="text-[10px] font-semibold text-gray-700">
                              {item.visitorsCount !== undefined && item.visitorsCount > 0
                                ? item.visitorsCount.toLocaleString('id-ID')
                                : '0'}
                            </span>
                          </div>
                        </div>

                        {/* Destination Title */}
                        <h3
                          className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-1 group-hover:text-[#4941EC] transition-colors"
                          title={item.name}
                        >
                          {item.name}
                        </h3>

                        {/* Regency */}
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {item.regency}
                        </p>
                      </div>

                      {/* Distance & Action */}
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-50">
                        <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-[#60CE9F] fill-[#60CE9F] shrink-0 rotate-45" />
                          <span>{item.distance}</span>
                        </span>
                        <span className="text-[11px] font-bold text-[#60CE9F] group-hover:text-[#4EB789] transition-colors">
                          Detail &rsaquo;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
