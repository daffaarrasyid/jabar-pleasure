'use client';

import React, { useEffect, useState, useTransition } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import SearchBar from '@/components/home/SearchBar';
import CategoryFilter from '@/components/home/CategoryFilter';
import FeaturedEntertainment from '@/components/home/FeaturedEntertainment';
import SpatialRadarCard from '@/components/home/SpatialRadarCard';
import NearbyRecommendations, { NearbyItem } from '@/components/home/NearbyRecommendations';
import TopDestinationsView from '@/components/home/TopDestinationsView';
import CategoryFilterModal from '@/components/home/CategoryFilterModal';
import { searchDestinations, ApiDestination } from '@/lib/api';
import { Star, Navigation, MapPin, SearchX } from 'lucide-react';

interface HomeScreenProps {
  onNavigateToMap?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onProfileClick?: () => void;
  onNavigateToRencana?: () => void;
  onNavigateToRiwayat?: () => void;
  onItemClick?: (item: { id: string | number; name: string; slug?: string }) => void;
  favoritBadgeCount?: number;
  initialViewMode?: 'overview' | 'top-destinations';
  className?: string;
}

const FALLBACK_SEARCH_IMAGES = [
  '/gunung-malabar.jpg',
  '/tangkuban-parahu.jpg',
  '/floating-market.jpg',
  '/gedung-sate.jpg',
  '/tahura-juanda.jpg',
  '/ranca-upas.jpg',
];

export default function HomeScreen({
  onNavigateToMap,
  onNotificationClick,
  onWishlistClick,
  onProfileClick,
  onNavigateToRencana,
  onNavigateToRiwayat,
  onItemClick,
  favoritBadgeCount = 0,
  initialViewMode = 'overview',
  className = '',
}: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'top-destinations'>(initialViewMode);
  const [activeTab, setActiveTab] = useState<NavTabId>('beranda');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Search state
  const [searchResults, setSearchResults] = useState<ApiDestination[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Try to acquire device geolocation for real spatial proximity
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation unavailable, defaulting to Bandung:', error.message);
          setUserCoords({ lat: -6.9175, lng: 107.6191 });
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  // Debounced search effect when typing or changing category
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchDestinations(trimmed, {
        category: selectedCategory !== 'Semua' ? selectedCategory : undefined,
        lat: userCoords?.lat ?? -6.9175,
        lng: userCoords?.lng ?? 107.6191,
        limit: 20,
      })
        .then((items) => {
          startTransition(() => {
            setSearchResults(items);
            setIsSearching(false);
          });
        })
        .catch((err) => {
          console.warn('Search query failed:', err);
          setIsSearching(false);
          setSearchResults([]);
        });
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, userCoords?.lat, userCoords?.lng]);

  const handleTabChange = (tab: NavTabId) => {
    setActiveTab(tab);
    if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onProfileClick?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    } else if (tab === 'rencana') {
      onNavigateToRencana?.();
    }
  };

  const isSearchActive = searchQuery.trim().length > 0;

  if (viewMode === 'top-destinations') {
    return (
      <TopDestinationsView
        onBack={() => setViewMode('overview')}
        onNavigateToMap={onNavigateToMap}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick || onProfileClick}
        onProfileClick={onProfileClick}
        onNavigateToRiwayat={onNavigateToRiwayat}
        onItemClick={onItemClick}
        favoritBadgeCount={favoritBadgeCount}
        selectedCategory={selectedCategory}
        className={className}
      />
    );
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* Top Header with Brand Logo, Notifications, and Wishlist Button */}
      <AppHeader
        unreadNotifications={2}
        wishlistCount={favoritBadgeCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick || onProfileClick}
      />

      {/* Main Scrollable Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
        {/* Search Bar & Filter Button */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Cari nama destinasi wisata..."
          filterBadgeCount={selectedCategory !== 'Semua' ? 1 : 0}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />

        {/* Categories Horizontal Carousel */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Conditional Rendering: Search Results vs Standard Home Feed */}
        {isSearchActive ? (
          <section className="w-full px-5 py-3">
            {/* Search Header */}
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  Hasil Pencarian
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Menampilkan hasil untuk &ldquo;{searchQuery}&rdquo;
                  {selectedCategory !== 'Semua' && ` di kategori ${selectedCategory}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-[#4941EC] hover:underline cursor-pointer"
              >
                Kembali
              </button>
            </div>

            {/* Loading Skeleton */}
            {isSearching ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="flex items-center gap-3.5 p-2 bg-white rounded-2xl border border-gray-100 animate-pulse"
                  >
                    <div className="w-[88px] h-[88px] rounded-xl bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              /* Exact Required Text when destination is not registered */
              <div className="flex flex-col items-center justify-center py-14 px-4 bg-white rounded-2xl border border-gray-100/90 shadow-xs text-center my-2">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
                  <SearchX className="w-7 h-7 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  destinasi belum terdaftar
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 max-w-[270px] leading-relaxed">
                  Destinasi wisata yang Anda cari belum ditemukan di database. Silakan periksa kembali ejaan kata kunci atau pilih kategori lain.
                </p>
                {selectedCategory !== 'Semua' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Semua')}
                    className="mt-4 px-4 py-2 bg-[#EEF0FF] text-[#4941EC] text-xs font-semibold rounded-xl hover:bg-[#E0E4FF] transition-colors cursor-pointer"
                  >
                    Reset Filter Kategori ({selectedCategory})
                  </button>
                )}
              </div>
            ) : (
              /* Search Results List */
              <div className="flex flex-col gap-3">
                {searchResults.map((item, idx) => {
                  const fallbackImg = FALLBACK_SEARCH_IMAGES[idx % FALLBACK_SEARCH_IMAGES.length];
                  const distStr = item.distance_km ? `${item.distance_km} km` : 'Dekat Anda';
                  const locStr = item.address || item.regency?.name || 'Jawa Barat';

                  return (
                    <div
                      key={item.id}
                      onClick={() => onItemClick?.({ id: item.id, name: item.name, slug: item.slug })}
                      className="group flex items-center gap-3.5 p-2 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-[92px] h-[92px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.cover_image_url || fallbackImg}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/gunung-malabar.jpg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 flex flex-col justify-between self-stretch py-0.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="bg-[#EEF0FF] text-[#4941EC] text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[130px]">
                            {item.category?.name || 'Wisata'}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-[#EDAD40] text-[#EDAD40]" />
                            <span className="text-xs font-bold text-gray-800">
                              4.8
                            </span>
                          </div>
                        </div>

                        {/* Title & Location */}
                        <div className="mt-1">
                          <h3
                            className="text-sm font-bold text-gray-900 group-hover:text-[#4941EC] transition-colors truncate"
                            title={item.name}
                          >
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{locStr}</span>
                          </p>
                        </div>

                        {/* Distance & Action */}
                        <div className="flex items-center justify-between mt-1 pt-0.5">
                          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-[#60CE9F] fill-[#60CE9F] shrink-0 rotate-45" />
                            <span>{distStr}</span>
                          </span>
                          <span className="text-xs font-bold text-[#60CE9F] group-hover:text-[#4EB789] transition-colors flex items-center gap-0.5">
                            Detail <span className="text-sm leading-none">&rsaquo;</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          /* Standard Overview Home Feed */
          <>
            {/* Featured Section: Tempat Hiburan untuk Anda */}
            <FeaturedEntertainment
              selectedCategory={selectedCategory}
              userCoords={userCoords}
              onViewAll={() => setViewMode('top-destinations')}
              onItemClick={(item) => onItemClick?.(item)}
            />

            {/* Spatial Radar Card: Jawa Barat */}
            <SpatialRadarCard
              latitude={userCoords ? userCoords.lat.toFixed(4) : "-6.9175"}
              longitude={userCoords ? userCoords.lng.toFixed(4) : "107.6191"}
            />

            {/* Rekomendasi Terdekat Section */}
            <NearbyRecommendations
              selectedCategory={selectedCategory}
              userCoords={userCoords}
              onItemClick={(item: NearbyItem) => onItemClick?.(item)}
            />
          </>
        )}
      </main>

      {/* Category Filter Bottom Sheet / Modal */}
      <CategoryFilterModal
        isOpen={isFilterModalOpen}
        selectedCategory={selectedCategory}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(cat) => setSelectedCategory(cat)}
      />

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
